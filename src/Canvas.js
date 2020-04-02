import React from "react";


class Canvas extends React.Component
{
    constructor(props) {
        super(props);
        this.canvas =  <canvas id="canvas" width="700" height="600"/>
        this.g = null;
        this.clicked = false;
        this.last_x = 0;
        this.last_y = 0;
        this.handler = this.handler.bind(this)
    }

    draw_line(last_x,last_y,x,y)
    {
        this.fill(x,y)
        this.g.beginPath()
        this.g.moveTo(last_x,last_y)
        this.g.lineTo(x,y)
        if (this.props.tool === "eraser")
        {
            this.g.strokeStyle = 'white';
        }
        else
        {
            this.g.strokeStyle = this.props.color
        }
        this.g.lineCap = 'round';
        this.g.lineWidth = this.props.width
        this.g.stroke()
    }

    fill(x,y)
    {
        var canv = this.g.getImageData(x,y,1,1)
        var data = canv.data
        var color = 'rgb('+data[0]+','+data[1]+','+data[2]+')';
        if (color !== this.props.color)
        {
            this.g.moveTo(x,y)
            this.g.lineTo(x,y)
            this.g.strokeStyle = this.props.color
            this.g.stroke()
        }


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
                this.draw_line(this.last_x,this.last_y,x,y)
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