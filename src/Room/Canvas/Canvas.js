import React from "react";
import { RoomComponent, connectRoomComponent } from '../RoomComponent';

class Canvas extends RoomComponent {
    constructor(props) {
        super(props);
        this.props.socket.on('draw_instr', (data) => this.updateDraw(data))
        this.props.socket.on('round_start',(infos)=>this.roundStart(infos))
        this.props.socket.on('round_end',(infos)=>this.roundEnd(infos))
        this.props.socket.on('game_start',(infos)=>this.gameStart(infos))
        this.props.socket.on('game_end',(infos)=>this.gameEnd(infos))
        this.props.socket.on('game_info',(infos)=>this.gameInfo(infos))
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
            if (instr.type === 'line')
                this.draw_line(instr.data.coordinates[0], instr.data.coordinates[1], instr.data.coordinates[2], instr.data.coordinates[3], instr.data.color, instr.data.width, instr.data.tool)
            else if (instr.type ==='trash')
                this.clearCanvas()
        }
    }

    clearCanvas()
    {
        const canvas = this.canvasRef.current
        this.ctx = canvas.getContext('2d')
        this.ctx.clearRect(0,0,700,600)
    }

    draw_line(last_x, last_y, x, y, color, width, tool) {
        this.ctx.beginPath()
        this.ctx.moveTo(last_x, last_y)
        this.ctx.lineTo(x, y)
        if (tool === "eraser") {
            this.ctx.strokeStyle = 'white';
        } else {
            this.ctx.strokeStyle = color
        }
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
                this.draw_line(this.last_x, this.last_y, x, y, this.props.roomInfo.tool.color, this.props.roomInfo.tool.width, this.props.roomInfo.tool.type)
                this.props.socket.emit("draw_instr", {
                    type : 'line',
                    data:{  coordinates: [this.last_x, this.last_y, x, y],
                            color:  this.props.roomInfo.tool.color,
                            tool:   this.props.roomInfo.tool.type,
                            width:  this.props.roomInfo.tool.width
                    }
                });
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

    setOverlay(text)
    {
        let canvas = document.getElementById('canvas');
        canvas.style.display = 'none'
        let overlay  = document.getElementById('overlay');
        overlay.style.display = 'block'
        let overlayText  = document.getElementById('text-overlay');
        overlayText.innerText = text

    }

    setCanvas()
    {
        let canvas = document.getElementById('canvas');
        canvas.style.display = 'block'
        let overlay  = document.getElementById('overlay');
        overlay.style.display = 'none'
        let overlayText  = document.getElementById('text-overlay');
        overlayText.innerHTML = ""
    }

    roundStart(infos)
    {
        this.setCanvas();
    }

    roundEnd(infos)
    {
        let scores = "";
        for (let player in infos.players)
        {
            scores += player.username + ' +' + player.score_gained + '<b>';
        }
        this.setOverlay(scores)
        this.clearCanvas()
    }

    gameStart(infos)
    {
        this.setOverlay("La partie va commencer dans " + infos.delay + " secondes")
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
        let textFinal = ""
        let rank = 1;
        for(let player in infos.players)
        {
            textFinal += rank + " " + player.username + " : " + player.score
            rank ++
        }
        this.setOverlay(textFinal);

    }

    gameInfo(infos)
    {
        if (infos.gameStarted === false)
            this.setOverlay("En attente de joueurs")
        else
        {
            if (infos.roundStarted)
            {
                this.clearCanvas()
                this.updateDraw(infos.draw_inst)
            }
            else
            {
                this.setOverlay("Le prochain round va bientôt commencer !")
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
                <div id="overlay" ><p id="text-overlay" style={{ textAlign: 'center',fontSize: '30px'}}></p></div>
                <canvas ref={this.canvasRef} id="canvas" width="700" height="600"/>
            </div>
        );
    }

}

export default connectRoomComponent(Canvas);
