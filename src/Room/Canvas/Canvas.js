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
        this.ctx = null;
        this.clicked = false;
        this.last_x = 0;
        this.last_y = 0;
        this.handler = this.handler.bind(this)
        this.updateDraw = this.updateDraw.bind(this)

    }



    updateDraw(data) {
        for (let instr of data) {
            if (instr.type === DrawInstrFactory.types.trash) {
                this.clearCanvas();
            } else {
                this.draw_instr(instr.type, instr.options);
            }
        }
    }

    clearCanvas()
    {
        const canvas = this.canvasRef.current
        this.ctx = canvas.getContext('2d')
        this.ctx.clearRect(0,0,700,600)
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

        switch(event.type) {
            case "mousedown":
                this.last_x = x;
                this.last_y = y;
                this.clicked = true;
                break;
            case "mousemove":
                if (!this.clicked) break;
                const tool = this.props.roomInfo.tool;
                const pos = [this.last_x, this.last_y, x, y];
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
        canvas.addEventListener("mousedown", event => this.handler(event))
        canvas.addEventListener("mouseup",   event => this.handler(event))
        canvas.addEventListener("mouseout",  event => this.handler(event))
        canvas.addEventListener("mousemove", event => this.handler(event))
    }



    render() {
        return (
            <div>
                {this.state.displayOverlay ? <div id="overlay" >{this.state.overlay}</div> : ''}
                <canvas ref={this.canvasRef} id="canvas" width="700" height="600"/>
            </div>
        )
    }

}

export default connectRoomComponent(Canvas);
