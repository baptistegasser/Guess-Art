import React from "react";


class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.props.socket.on('draw_instr', (data) => this.updateDraw(data))
        this.canvas = <canvas id="canvas" width="700" height="600"/>
        this.ctx = null;
        this.clicked = false;
        this.last_x = 0;
        this.last_y = 0;
        this.handler = this.handler.bind(this)
        this.updateDraw = this.updateDraw.bind(this)

    }

    updateDraw(data) {
        for (let instr of data) {
            this.draw_line(instr.coordinates[0], instr.coordinates[1], instr.coordinates[2], instr.coordinates[3], instr.color, instr.width, instr.tool)
        }


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
        if (!this.props.boss) return;

        var x = Math.trunc(event.offsetX)
        var y = Math.trunc(event.offsetY)

        if (event.type === "mousedown") {
            this.clicked = true;
            this.last_x = x;
            this.last_y = y;
        }
        if (event.type === "mousemove") {
            if (this.clicked === true) {
                this.draw_line(this.last_x, this.last_y, x, y, this.props.color, this.props.width, this.props.tool)
                this.props.socket.emit("draw_instr", [{
                    coordinates: [this.last_x, this.last_y, x, y],
                    color: this.props.color,
                    tool: this.props.tool,
                    width: this.props.width
                }])
                this.last_x = x;
                this.last_y = y;
            }
        }
        if (event.type === "mouseup" || event.type === "mouseout") {
            this.clicked = false;
        }


    }

    componentDidMount() {
        var canvas = document.getElementById("canvas")
        this.ctx = canvas.getContext('2d')
        canvas.addEventListener("mousedown", event => this.handler(event))
        canvas.addEventListener("mouseup",   event => this.handler(event))
        canvas.addEventListener("mouseout",   event => this.handler(event))
        canvas.addEventListener("mousemove", event => this.handler(event))
    }

    render() {
        return this.canvas
    }

}

export default Canvas
