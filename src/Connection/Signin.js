import React from "react";
import { Form } from "react-bootstrap";
import { Link } from 'react-router-dom';
import ConnectForm from './ConnectForm';
import Verification from '../Utils';

class Signin extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            rememberMe: false
        };
        this.FormRef = React.createRef();

        this.checkAndSubmit = this.checkAndSubmit.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleRememberMeChange = this.handleRememberMeChange.bind(this);
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handleRememberMeChange(event) {
        this.setState({ rememberMe: event.target.value });
    }

    render() {
        return (
        <ConnectForm onSubmit={this.checkAndSubmit} submit_text='Sign in' ref={this.FormRef}>
            <Form.Group controlId='UsernameGroup'>
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter your Username"
                    value={this.state.username}
                    onChange={this.handleUsernameChange}/>
            </Form.Group>
            <Form.Group controlId='PasswordGroup'>
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}/>
            </Form.Group>
            <Form.Group controlId='RememberMeGroup'>
                <Form.Check
                    type='switch'
                    label='Remember me'
                    value={this.state.rememberMe}
                    onChange={this.handleRememberMeChange}/>
            </Form.Group>
            <Form.Group>
                <Link to='/signup'>I don't have an account</Link>
            </Form.Group>
        </ConnectForm>
        )
    }

    async checkAndSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        // Retrieve data to prevent change during handling
        const username = this.state.username;
        const password = this.state.password;
        const rememberMe = this.state.rememberMe;

        // Ensure the fields are valid
        if (!Verification.checkString(username, 'Username') || !Verification.checkString(password, 'Password')) {
            this.FormRef.current.displayError(Verification.getMessage());
            return;
        }

        await this.submitForm(username, password, rememberMe);
    }

    async submitForm(username, password, rememberMe) {
        // Create the and send the signin request
        var data = new URLSearchParams();
        data.append('username', username);
        data.append('password', password);
        data.append('rememberMe', rememberMe);
        const response = await fetch('/api/v1/signin', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: data
        });

        // If response is ok redirect
        if (response.ok) {
            window.location.href = '/room';
        } else {
            let message = 'Unknown error while sign in. If it keep happening, please contact an admin.';

            // If it's not a server error, retrieve the message
            if (response.status !== 500) {
                const json = await response.json();
                message = json.message;
            }

            this.FormRef.current.displayError(message);
        }
    }
}

export default Signin;