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
                case DrawInstrFactory.types.bucket:
                    return this.fillCanvas(instr.options)
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
        this.ctx.clearRect(0,0,700,600)
    }

    fillCanvas(options) {
        const width = this.ctx.canvas.width;
        const height = this.ctx.canvas.height;
        let imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let data = imageData.data;

        this.canvasRef.current.width = width*2
        this.canvasRef.current.height = height*2
        this.canvasRef.current.width = width
        this.canvasRef.current.height = height

        function posToRGBA(x, y) {
            const offset = 4 * ((y-1)*width + x);
            return [data[0+offset], data[1+offset], data[2+offset], data[3+offset]]
        }
        function sameRGBA(rgba_1, rgba_2) {
            for (let i in rgba_1) {
                if (rgba_1[i] !== rgba_2[i]) {
                    if (i === 3) console.log('failed on alpha');
                    return false;
                }
            }
            return true;
        }
        function colorPos(x, y, rgba) {
            const offset = 4 * ((y-1)*width + x);
            data[0+offset] = rgba[0];
            data[1+offset] = rgba[1];
            data[2+offset] = rgba[2];
            data[3+offset] = rgba[3];
        }
        class Point {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
        }

        const x = options.pos[2];
        const y = options.pos[3];

        // TODO remove pink
        const targetRGBA = [255, 20, 147, 255];
        const srcRGBA = posToRGBA(x, y);

        // Don't try to fill if the color to replace is the same
        if (targetRGBA === srcRGBA) {
            return;
        }

        let queue = [];
        colorPos(x, y, [255,255,255,255]);
        queue.push(new Point(x, y));

        while(queue.length > 0) {
            const n = queue.shift();
            for (let next of [new Point(n.x-1, n.y), new Point(n.x, n.y-1), new Point(n.x+1, n.y), new Point(n.x, n.y+1)]) {
                if (sameRGBA(srcRGBA, posToRGBA(next.x, next.y))) {
                    colorPos(next.x, next.y, targetRGBA);
                    queue.push(next);
                }
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    draw_instr(type, options) {
        const pos = options.pos;
        switch(type) {
            case DrawInstrFactory.types.pencil:
                return this.draw_line(pos[0], pos[1], pos[2], pos[3], options.color, options.width);
            case DrawInstrFactory.types.eraser:
                return this.draw_line(pos[0], pos[1], pos[2], pos[3], 'white', options.width);
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
                <svg width="0" height="0" style={{position: 'absolute',zIndex: '-1'}}>
                    <defs>
                        <filter id="remove-alpha" x="0" y="0" width="100%" height="100%">
                        <feComponentTransfer>
                            <feFuncA type="discrete" tableValues="0 1"></feFuncA>
                        </feComponentTransfer>
                        </filter>
                    </defs>
                    </svg>
                <canvas ref={this.canvasRef} id="canvas" width="700" height="600"/>
            </div>
        )
    }

}

export default connectRoomComponent(Canvas);
