import React from "react";
import {RoomComponent, connectRoomComponent} from '../RoomComponent';



class Chat extends RoomComponent
{
    constructor(props) {
        super(props);
        this.props.socket.on('user_msg',(data) => this.updateChat(data))
        this.props.socket.on('guess_success',() => this.successGuess())
        this.writeMessage = this.writeMessage.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.updateChat = this.updateChat.bind(this)
        this.successGuess = this.successGuess.bind(this)
    }

    handleChange(event){
    }

    writeMessage(event)
    {
        if (event.key === "Enter")
        {
            event.preventDefault();
            var inp = document.getElementById('input-msg')
            console.log(inp.value)
            this.props.socket.emit("guess",inp.value);
            inp.value = "";

        }

    }

    updateChat(data)
    {
        document.getElementById("chat").innerHTML = document.getElementById("chat").innerHTML + "<p style='margin-bottom: 0'>" +data.username+">"+data.message +" </p>"
    }

    successGuess()
    {
        document.getElementById("chat").innerHTML = document.getElementById("chat").innerHTML + "<p style='margin-bottom: 0;color: green'> Tu as trouvé le mot! Bravo!</p>"
    }

    render() {
        if (this.props.roomInfo.isBoss === false)
        {
            return<div>
                <div id="chat"></div>
                <input id="input-msg" placeholder="Ecrire ici" onChange={this.handleChange} onKeyPress={this.writeMessage}/>
            </div>
        }
        else
            return <div id="chat"/>

    }
}

export default connectRoomComponent(Chat);
