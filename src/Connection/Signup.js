import React from "react";
import ConnectForm from './ConnectForm';
import { Form } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Verification from '../Verification';

class Signup extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            password_2: '',
        };
        this.FormRef = React.createRef();

        this.checkAndSubmit = this.checkAndSubmit.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handlePassword_2Change = this.handlePassword_2Change.bind(this);
    }

    handleEmailChange (event) {
        this.setState({ email: event.target.value });
    }

    handleUsernameChange (event) {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange (event) {
        this.setState({ password: event.target.value });
    }

    handlePassword_2Change (event) {
        this.setState({ password_2: event.target.value });
    }

    render() {
        return (
        <ConnectForm onSubmit={this.checkAndSubmit} submit_text='Sign me up !' ref={this.FormRef}>
            <Form.Group controlId='E-mailGroup'>
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                    required
                    type="email"
                    placeholder="Enter your e-mail address"
                    value={this.state.email}
                    onChange={this.handleEmailChange}/>
            </Form.Group>
            <Form.Group controlId='UsernameGroup'>
                <Form.Label>Username</Form.Label>
                <Form.Control
                    required
                    type="text"
                    placeholder="Enter your username"
                    value={this.state.username}
                    onChange={this.handleUsernameChange}/>
            </Form.Group>
            <Form.Group controlId='PasswordGroup'>
                <Form.Label>Password</Form.Label>
                <Form.Control
                    required
                    type="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}/>
                <Form.Control
                    required
                    type="password"
                    placeholder="Validate your password"
                    value={this.state.password_2}
                    onChange={this.handlePassword_2Change}/>
            </Form.Group>
            <Form.Group>
                <Link to='/signin'>I already have an account</Link>
            </Form.Group>
        </ConnectForm>
        );
    }

    async checkAndSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        // Retrieve data to prevent change during handling
        const email = this.state.email;
        const username = this.state.username;
        const password = this.state.password;
        const password_2 = this.state.password_2;

        // Ensure the fields are valid
        if (!Verification.checkString(email, 'E-mail') || !Verification.checkString(username, 'Username') || !Verification.checkPassword(password, password_2)) {
            this.FormRef.current.displayError(Verification.getMessage());
            return;
        }

        await this.submitForm(email, username, password);
    }

    async submitForm(email, username, password) {
        // Create the and send the signup request
        var data = new URLSearchParams();
        data.append('email', email);
        data.append('username', username);
        data.append('password', password);
        const response = await fetch('/api/v1/signup', {
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

export default Signup;