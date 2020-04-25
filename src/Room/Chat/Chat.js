import React from "react";
import {RoomComponent, connectRoomComponent} from '../RoomComponent';
import './Chat.css';
import { Form } from "react-bootstrap";

class Chat extends RoomComponent {
    constructor(props) {
        super(props);
        this.state = {
            autoScroll: true
        }

        this.props.socket.on('user_msg', (data) => this.displayMessage(data));
        this.props.socket.on('guess_success', () => this.displayGuessSuccess());

        this.onSubmit = this.onSubmit.bind(this);
        this.displayMessage = this.displayMessage.bind(this);
        this.displayGuessSuccess = this.displayGuessSuccess.bind(this);
        this.scrollDown = this.scrollDown.bind(this);
        this.handleScroll = this.handleScroll.bind(this);

        this.chatRef = React.createRef();
        this.inputRef = React.createRef();
    }

    displayMessage(data) {
        let html = '';
        if (data.username !== undefined && data.username.length > 0) {
            html = `<p><span class='username'>${data.username}</span> : `;
        }
        html += `<span class='message'>${data.message}</span></p>`;
        this.chatRef.current.innerHTML += html;
        this.scrollDown()
    }

    displayGuessSuccess() {
        this.chatRef.current.innerHTML += "<p class='success'>You guessed the word !</p>";
        this.scrollDown()
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.socket.emit("guess", this.inputRef.current.value);
        this.inputRef.current.value = ''
    }

    scrollDown() {
        if (this.state.autoScroll === true) {
            this.chatRef.current.scrollTop = this.chatRef.current.scrollTopMax;
        }
    }

    handleScroll(event) {
        const div = event.target;
        const remaining = div.scrollHeight - (div.scrollTop + div.clientHeight)
        if (remaining === 0 && this.state.autoScroll !== true) {
            this.setState({ autoScroll: true });
        } else if (remaining > 0 && this.state.autoScroll !== false) {
            this.setState({ autoScroll: false });
        }
    }

    render() {
        let inputForm = (
            <form onSubmit={this.onSubmit}>
                <Form.Control ref={this.inputRef} autoFocus={true} type="text" id="input-msg" placeholder="Write here"/>
            </form>
        );

        // if  we are the boss remove the chat form
        if (this.props.roomInfo.isBoss === true) {
            inputForm = '';
        }

        return (
            <div id="chat-wrapper">
                <div ref={this.chatRef} onScroll={this.handleScroll} id="chat" />
                {inputForm}
            </div>
        );
    }
}

export default connectRoomComponent(Chat);
