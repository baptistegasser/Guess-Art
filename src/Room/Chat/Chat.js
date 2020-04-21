import React from "react";
import {RoomComponent, connectRoomComponent} from '../RoomComponent';



class Chat extends RoomComponent {
    constructor(props) {
        super(props);
        this.props.socket.on('user_msg', (data) => this.displayMessage(data));
        this.props.socket.on('guess_success', () => this.displayGuessSuccess());

        this.onSubmit = this.onSubmit.bind(this);
        this.displayMessage = this.displayMessage.bind(this);
        this.displayGuessSuccess = this.displayGuessSuccess.bind(this);

        this.chatRef = React.createRef();
        this.inputRef = React.createRef();
    }

    displayMessage(data) {
        this.chatRef.current.innerHTML += "<p style='margin-bottom: 0'>" +data.username+">"+data.message +" </p>"
    }

    displayGuessSuccess() {
        this.chatRef.current.innerHTML += "<p style='margin-bottom: 0;color: green'> Tu as trouvé le mot! Bravo!</p>"
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.socket.emit("guess", this.inputRef.current.value);
        this.inputRef.current.value = ''
    }

    render() {
        let inputForm = (
            <form onSubmit={this.onSubmit} >
                <input ref={this.inputRef} id="input-msg" placeholder="Write here"/>
            </form>
        );
        // if  we are the boss remove the chat form
        if (this.props.roomInfo.isBoss === true) {
            inputForm = '';
        }

        return (
            <div>
                <div ref={this.chatRef} id="chat" />
                {inputForm}
            </div>
        );
    }
}

export default connectRoomComponent(Chat);
