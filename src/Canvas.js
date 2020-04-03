import React from "react";


class Canvas extends React.Component
{
    constructor(props) {
        super(props);
        this.props.socket.on('draw_instr',()=>this.updateDraw(data))
        this.canvas =  <canvas id="canvas" width="700" height="600"/>
        this.g = null;
        this.clicked = false;
        this.last_x = 0;
        this.last_y = 0;
        this.handler = this.handler.bind(this)
    }

    updateDraw(data)
    {
        data.forEach(index=>
        {
            this.draw_line(data[index].coordinates[0],data[index].coordinates[1],data[index].coordinates[2],data[index].coordinates[3],data[index].color,data[index].width,data[index].tool)
        })
    }

    draw_line(last_x,last_y,x,y,color,width,tool)
    {
        this.g.beginPath()
        this.g.moveTo(last_x,last_y)
        this.g.lineTo(x,y)
        if (tool === "eraser")
        {
            this.g.strokeStyle = 'white';
        }
        else
        {
            this.g.strokeStyle = color
        }
        this.g.lineCap = 'round';
        this.g.lineWidth = width
        this.g.stroke()
        this.props.socket.emit("draw_instr",{1:{coordinates:{last_x,last_y,x,y},color:color,tool:tool,width:width}})
    }

    handler(event)
    {
        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top
        if (event.type === "mousedown")
        {
            console.log(x+" "+y);
            this.clicked= true;
            this.last_x = x;
            this.last_y = y;
        }
        if (event.type === "mousemove")
        {
            if (this.clicked === true)
            {
                console.log(x+" "+y)
                this.draw_line(this.last_x,this.last_y,x,y,this.props.color,this.props.width,this.props.tool)
                this.last_x = x;
                this.last_y = y;
            }
        }
        if (event.type === "mouseup")
        {
            this.clicked= false;
        }



    }


    componentDidMount()
    {

        var canvas  = document.querySelector('canvas')
        this.g = canvas.getContext('2d')
        this.g.miterLimit = 1;
        if (this.props.boss === true)
        {
            canvas.addEventListener("mousedown",this.handler)
            canvas.addEventListener("mouseup",this.handler)
            canvas.addEventListener("mousemove",this.handler)
        }

    }

    render() {
        return this.canvas
    }

}

export default Canvas