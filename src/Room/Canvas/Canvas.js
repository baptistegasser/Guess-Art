import React from "react";
import { RoomComponent, connectRoomComponent } from '../RoomComponent';
import DrawInstrFactory from '../../DrawInstrFactory';
import './Canvas.css';

class Canvas extends RoomComponent {
    constructor(props) {
        super(props);
        this.props.socket.on('draw_instr', (data) => this.updateDraw(data))
        this.props.socket.on('round_start',(infos)=>this.roundStart(infos))
        this.props.socket.on('round_end',(infos)=>this.roundEnd(infos))
        this.props.socket.on('game_start',(infos)=>this.gameStart(infos))
        this.props.socket.on('game_end',(infos)=>this.gameEnd(infos))
        this.props.socket.on('game_info',(infos)=>this.gameInfo(infos))
        this.state = {displayOverlay : false,overlay:null}
        this.canvasRef = React.createRef();
        /** @type {CanvasRenderingContext2D} */
        this.ctx = null;
        this.clicked = false;
        this.last_x = 0;
        this.last_y = 0;
        this.handler = this.handler.bind(this)
        this.updateDraw = this.updateDraw.bind(this)

    }



    updateDraw(data) {
        for (let instr of data) {
            switch(instr.type) {
                case DrawInstrFactory.types.trash:
                    return this.clearCanvas();
                default:
                    return this.draw_instr(instr.type, instr.options);
            }
        }
    }

    clearCanvas()
    {
        const canvas = this.canvasRef.current
        this.ctx = canvas.getContext('2d')
        this.ctx.clearRect(0,0,this.canvasRef.current.width,this.canvasRef.current.height)
    }

    fillCanvas(x, y, color) {
        const width = this.ctx.canvas.width;
        const height = this.ctx.canvas.height;
        let imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // The buffer contain the actual pixel datas, the buf8 and data arrays are used to get the datas
        // in different format (rgba can be encoded as 4*8bits values or 1*32bits value)
        let buf = imageData.data.buffer;
        let buf8 = new Uint8ClampedArray(buf);
        let data = new Uint32Array(buf);

        const colorSplitted = color.replace('rgb(', '').replace(')', '').split(',');
        const targetColor = (colorSplitted[0] | (colorSplitted[1] << 8) | (colorSplitted[2] << 16) | (255 << 24)) >>> 0;
        const srcColor = data[y*width + x];
        // Don't try to fill if the color to replace is the same
        if (srcColor === targetColor) {
            return;
        }

        class Point {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.color = data[y*width + x]
            }

            paint() {
                data[this.y*width + this.x] = targetColor;
            }
        }

        let startPoint = new Point(x, y);
        startPoint.paint();
        let queue = [startPoint];

        while(queue.length > 0) {
            const n = queue.shift();
            // Loop throught neighbour pixels
            for (let next of [new Point(n.x-1, n.y), new Point(n.x, n.y-1), new Point(n.x+1, n.y), new Point(n.x, n.y+1)]) {
                // Ignore if out of bound
                if (next.x < 0 || next.y < 0 || next.x > width || next.y > height) {
                    continue;
                }
                // If color of the point is valid, paint him and add hime to the queue
                if (srcColor === next.color) {
                    next.paint();
                    queue.push(next);
                }
            }
        }

        // Set the updated data back and update the canvas.
        imageData.data.set(buf8);
        this.ctx.putImageData(imageData, 0, 0);
        console.log('finished filling');
    }

    draw_instr(type, options) {
        const pos = options.pos;
        switch(type) {
            case DrawInstrFactory.types.pencil:
                return this.draw_line(pos[0], pos[1], pos[2], pos[3], options.color, options.width);
            case DrawInstrFactory.types.eraser:
                return this.draw_line(pos[0], pos[1], pos[2], pos[3], 'white', options.width);
            case DrawInstrFactory.types.bucket:
                return this.fillCanvas(pos[2], pos[3], options.color);
            default:
                return console.error('Unsupported drawing instruction');
        }
    }

    draw_line(last_x, last_y, x, y, color, width) {
        this.ctx.filter = 'url(#remove-alpha)';
        this.ctx.beginPath()
        this.ctx.moveTo(last_x, last_y)
        this.ctx.lineTo(x, y)
        this.ctx.strokeStyle = color
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = width
        this.ctx.stroke()
    }

    handler(event) {
        if (!this.props.roomInfo.isBoss) return;

        const x = Math.trunc(event.offsetX)
        const y = Math.trunc(event.offsetY)
        const tool = this.props.roomInfo.tool;
        const pos = [this.last_x, this.last_y, x, y];

        switch(event.type) {
            case "mousedown":
                this.last_x = x;
                this.last_y = y;
                if (this.props.roomInfo.tool.type === DrawInstrFactory.types.bucket) {
                    this.props.socket.emit('draw_instr', DrawInstrFactory.newInstr(tool.type, pos, tool.color))
                } else {
                    this.clicked = true;
                }
                break;
            case "mousemove":
                if (!this.clicked) break;
                this.props.socket.emit("draw_instr", DrawInstrFactory.newInstr(tool.type, pos, tool.color, tool.width));
                this.last_x = x;
                this.last_y = y;
                break;
            case "mouseup":
            case "mouseout":
                this.clicked = false;
                break;
            default:
                console.error('Unknown canvas event !');
        }
    }

    roundStart(infos)
    {
        this.setState({displayOverlay:false})
    }

    roundEnd(infos)
    {
        const overlay = infos.players.map(player => {
            return <p className="text_overlay" key={player.username}>{player.username} + {player.score_gained} </p>;
        })
        this.setState({displayOverlay : true,overlay:overlay})
    }

    gameStart(infos)
    {
        let overlay = <p className="text_overlay">La partie va commencer dans  {infos.delay}  secondes</p>
        this.setState({displayOverlay : true,overlay:overlay})
    }

    gameEnd(infos)
    {
        function compare(a,b) {
            if (a.score > b.score)
                return 1;
            else if (a.score < b.score)
                return -1;
            else
                return 0;
        }

        infos.players.sort(compare)
        let rank = 0;
        const overlay = infos.players.map(player => {
            rank++;
            return <p className="text_overlay" key={player.username}>{rank} {player.username} : {player.score_gained} </p>;
        })
        this.setState({displayOverlay : true,overlay:overlay})

    }

    gameInfo(infos)
    {
        let overlay = "";
        if (infos.gameStarted === false)
        {
            overlay = <p className="text_overlay">En attente de joueurs</p>
            this.setState({displayOverlay : true,overlay:overlay})
        }
        else
        {
            if (infos.roundStarted)
            {
                this.clearCanvas()
                this.updateDraw(infos.draw_instr)
            }
            else
            {
                overlay = <p className="text_overlay">Le prochain round va bientôt commencer ! </p>
                this.setState({displayOverlay : true,overlay:overlay})
            }


        }
    }

    componentDidMount() {
        const canvas = this.canvasRef.current
        this.ctx = canvas.getContext('2d')
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        canvas.addEventListener("mousedown", event => this.handler(event))
        canvas.addEventListener("mouseup",   event => this.handler(event))
        canvas.addEventListener("mouseout",  event => this.handler(event))
        canvas.addEventListener("mousemove", event => this.handler(event))
    }



    render() {
        return (
            <div>
                {this.state.displayOverlay ? <div id="overlay" >{this.state.overlay}</div> : ''}
                {/* Adaptation of https://stackoverflow.com/a/49357655 solution to Anti-aliasing
                  * However, this is not even remotly anti-aliasing, but a cheap cheat to remove transparent pixels
                  * created by anti-aliasing
                */}
                <svg width="0" height="0" style={{position: 'absolute',zIndex: '-1'}}>
                    <defs>
                        <filter id="remove-alpha" x="0" y="0" width="100%" height="100%">
                        <feComponentTransfer>
                            <feFuncA type="discrete" tableValues="0 1"></feFuncA>
                        </feComponentTransfer>
                        </filter>
                    </defs>
                    </svg>
                <canvas ref={this.canvasRef} id="canvas" /*width="700" height="600"*//>
            </div>
        )
    }

}

export default connectRoomComponent(Canvas);
