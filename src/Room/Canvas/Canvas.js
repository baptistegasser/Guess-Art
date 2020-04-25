import React from "react";
import { RoomComponent, connectRoomComponent } from '../RoomComponent';
import DrawInstrFactory from '../../DrawInstrFactory';
import './Canvas.css';
import Chrono from "../Chrono/Chrono";
import { Table } from "react-bootstrap";

class Canvas extends RoomComponent {
    constructor(props) {
        super(props);
        props.socket.on('draw_instr',  (data) => this.updateDraw(data))
        props.socket.on('round_start', (infos)=>this.roundStart(infos))
        props.socket.on('round_end',   (infos)=>this.roundEnd(infos))
        props.socket.on('game_start',  (infos)=>this.gameStart(infos))
        props.socket.on('game_end',    (infos)=>this.gameEnd(infos))
        props.socket.on('game_info',   (infos)=>this.gameInfo(infos))
        this.state = {displayOverlay : false,overlay:null}
        this.canvasWrapperRef = React.createRef();
        this.canvasRef = React.createRef();
        this.ctx = null;
        this.clicked = false;
        this.last_x = 0;
        this.last_y = 0;
        this.handler = this.handler.bind(this)
        this.updateDraw = this.updateDraw.bind(this)
        this.updateCanvasSize = this.updateCanvasSize.bind(this);

        this.REF_WIDTH = 1250;
        this.REF_HEIGHT = 735;
        this.scale_x = 1.0;
        this.scale_y = 1.0;
    }

    updateDraw(data) {
        for (let instr of data) {
            switch(instr.type) {
                case DrawInstrFactory.types.trash:
                    return this.clearCanvas();
                default:
                    return this.draw_instr(instr);
            }
        }
    }

    clearCanvas() {
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
        const targetRGBA = new Uint8ClampedArray(new Uint32Array([srcColor]).buffer);
        let alt = [];
        if (targetRGBA[0] !== 0 || targetRGBA[0] !== 255) {
            const part = (targetRGBA[1] << 8) | (targetRGBA[2] << 16) | (255 << 24);
            [1,-1,2,-2].forEach(val => alt.push((targetRGBA[0]+val | part) >>> 0));
        }
        if (targetRGBA[1] !== 0 || targetRGBA[1] !== 255) {
            const part = targetRGBA[0] | (targetRGBA[2] << 16) | (255 << 24);
            [1,-1,2,-2].forEach(val => alt.push(((targetRGBA[1]+val << 8) | part) >>> 0));
        }
        if (targetRGBA[2] !== 0 || targetRGBA[2] !== 255) {
            const part = targetRGBA[0] | (targetRGBA[1] << 8) | (255 << 24);
            [1,-1,2,-2].forEach(val => alt.push(((targetRGBA[2]+val << 16) | part) >>> 0));
        }
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
                } else {
                    for (let altColor of alt) {
                        if (altColor === next.color) {
                            next.paint();
                            queue.push(next);
                            break;
                        }
                    }
                }
            }
        }

        // Set the updated data back and update the canvas.
        imageData.data.set(buf8);
        this.ctx.putImageData(imageData, 0, 0);
        console.log('finished filling');
    }

    draw_instr(instr) {
        const type = instr.type;
        const options = instr.options;
        const convertREFtoX = x => x * (this.canvasRef.current.width/this.REF_WIDTH);
        const convertREFtoY = y => y * (this.canvasRef.current.height/this.REF_HEIGHT);
        const last_x = convertREFtoX(options.pos[0]);
        const last_y = convertREFtoY(options.pos[1]);
        const x = convertREFtoX(options.pos[2]);
        const y = convertREFtoY(options.pos[3]);
        switch(type) {
            case DrawInstrFactory.types.pencil:
                return this.draw_line(last_x, last_y, x, y, options.color, options.width);
            case DrawInstrFactory.types.eraser:
                return this.draw_line(last_x, last_y, x, y, 'white', options.width);
            case DrawInstrFactory.types.bucket:
                return this.fillCanvas(x, y, options.color);
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
        const convertXToREF = x => x * (this.REF_WIDTH/this.canvasRef.current.width);
        const convertYToREF = y => y * (this.REF_HEIGHT/this.canvasRef.current.height);
        const pos = [convertXToREF(this.last_x), convertYToREF(this.last_y), convertXToREF(x), convertYToREF(y)];

        switch(event.type) {
            case "mousedown":
                this.last_x = x;
                this.last_y = y;
                if (this.props.roomInfo.tool.type === DrawInstrFactory.types.bucket) {
                    const instr = DrawInstrFactory.newInstr(tool.type, pos, tool.color);
                    this.props.socket.emit('draw_instr', instr);
                    this.draw_instr(instr);
                } else {
                    this.clicked = true;
                }
                break;
            case "mousemove":
                if (!this.clicked) break;
                const instr = DrawInstrFactory.newInstr(tool.type, pos, tool.color, tool.width);
                this.props.socket.emit("draw_instr", instr);
                this.draw_instr(instr);
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
        this.clearCanvas();
    }

    roundEnd(infos)
    {
        let usernames = []; let scores  = [];
        infos.players.sort((a, b) => b.score_gained - a.score_gained);
        infos.players.map(player => {usernames.push(player.username); scores.push(player.score_gained)})
        const overlay = (
            <>
                <h1>The word was : {infos.word}</h1>
                <h1>Round ended</h1>
                {this.createScoreTable(usernames, scores, '+')}
            </>
        );
        this.setState({displayOverlay : true, overlay: overlay});
    }

    gameStart(infos)
    {
        const overlay = <h1>The game will start in <Chrono autostart={true} duration={infos.delay} displayStyle='inline'></Chrono></h1>
        this.setState({displayOverlay : true,overlay:overlay})
    }

    gameEnd(infos)
    {
        let usernames = []; let scores  = [];
        infos.players.sort((a, b) => b.score - a.score);
        infos.players.map(player => {usernames.push(player.username); scores.push(player.score)})
        const overlay = (
            <>
                <h1>Game ended</h1>
                {this.createScoreTable(usernames, scores)}
            </>
        );
        this.setState({displayOverlay : true, overlay: overlay});
    }

    /**
     * Create a table to show the scores
     * @param {{username: string, score: number}[]} players
     */
    createScoreTable(usernames, scores, scorePrefix) {
        let body = [];
        for (let rank = 0, l = usernames.length; rank < l; ++rank) {
            body = [
                ...body,
                <tr key={rank+1}>
                    <td className='rank'>{rank+1}</td>
                    <td className='username'>{usernames[rank]}</td>
                    <td className='score'>{(scorePrefix === undefined ? '' : scorePrefix)+ scores[rank]}</td>
                </tr>
            ];
        }
        return (
            <Table className="scores">
                <tbody>
                    {body}
                </tbody>
            </Table>
        );
    }

    gameInfo(infos) {
        let overlay = "";
        if (infos.gameStarted === false) {
            overlay = <h1>Waiting for players</h1>
            this.setState({displayOverlay : true,overlay:overlay})
        } else {
            if (infos.roundStarted) {
                this.clearCanvas()
                this.updateDraw(infos.draw_instr)
            } else {
                overlay = <h1>Le prochain round va bientôt commencer !</h1>
                this.setState({displayOverlay : true,overlay:overlay})
            }
        }
    }

    componentDidMount() {
        const canvas = this.canvasRef.current
        this.ctx = canvas.getContext('2d')
        window.addEventListener('resize', this.updateCanvasSize);
        this.updateCanvasSize();
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        canvas.addEventListener("mousedown", event => this.handler(event))
        canvas.addEventListener("mouseup",   event => this.handler(event))
        canvas.addEventListener("mouseout",  event => this.handler(event))
        canvas.addEventListener("mousemove", event => this.handler(event))
    }

    updateCanvasSize() {
        // Save the canvas content
        const imageData = this.ctx.getImageData(0,0,this.canvasRef.current.width, this.canvasRef.current.height);
        // Reduce the canvas so, the canvasWrapper will now resize to it's css without the constrain of the canvas,
        // usefull when reducing the size, else the div won't reduce because of the canvas
        this.canvasRef.current.width = 10;
        this.canvasRef.current.height = 10;
        // Set the canvas size to the div
        this.canvasRef.current.width = this.canvasWrapperRef.current.clientWidth;
        this.canvasRef.current.height = this.canvasWrapperRef.current.clientHeight;
        // Set back the canvas content
        this.ctx.putImageData(imageData, 0, 0);
        // Update the scale
        this.scale_x = this.canvasRef.current.width/this.REF_WIDTH;
        this.scale_y = this.canvasRef.current.height/this.REF_HEIGHT;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateCanvasSize);
    }


    render() {
        return (
            <div id="canvas-wrap" ref={this.canvasWrapperRef}>
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
                <canvas ref={this.canvasRef} id="canvas"/>
            </div>
        )
    }

}

export default connectRoomComponent(Canvas);
