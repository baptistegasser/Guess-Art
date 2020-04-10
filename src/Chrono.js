import React from "react";

class Chrono extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {second : 30}
        this.props.socket.on('chrono_instr',(data) => this.updateChrono(data))
        this.updateChrono = this.updateChrono.bind(this)
        this.launchChrono = this.launchChrono.bind(this)
    }

    updateChrono(data)
    {
        this.setState({second : data})
        this.launchChrono()
    }

    launchChrono()
    {

        var chrono = setInterval(function () {
            if (this.state.second > 0)
                this.setState({second: this.state.second -1})
            else
            {
                clearInterval(chrono)
            }

        }.bind(this),1000)



    }
    componentDidMount() {
        this.setState({second : 5})
        this.launchChrono()
    }

    render() {
        return (
            <div style={{width:"60px",height:"50px"}}><p style={{background:"rgba(255,255,255,0)",backgroundImage:'url(https://media.giphy.com/media/YWmGm0UFfYnQs/giphy.gif)'}} >{this.state.second}</p></div>

        )
    }
}

export default Chrono
