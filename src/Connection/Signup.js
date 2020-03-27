import React from "react";
import ConnectForm from './ConnectForm';
import { Form } from "react-bootstrap";
import { Link } from 'react-router-dom';

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
        // Regex: 8 char min, 1 upper, 1 lower, 1 number, 1 special
        this.regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&\\/*])(?=.{8,})");
        this.space_regex = /\s/;

        this.displayError = this.displayError.bind(this);
        this.clearPassword = this.clearPassword.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handlePassword_2Change = this.handlePassword_2Change.bind(this);
        this.checkAndSubmit = this.checkAndSubmit.bind(this);
    }

    displayError(message) {
        this.FormRef.current.displayError(message);
    }

    containSpace(txt) {
        return /\s/.test(txt);
    }

    clearPassword () {
        this.setState({ password: '', password_2: '' });
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
            <Form.Group controlId='PseudoGroup'>
            <Form.Group controlId='PseudoGroup'>
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                    required
                    type="email"
                    placeholder="Enter your e-mail address"
                    value={this.state.email}
                    onChange={this.handleEmailChange}/>
            </Form.Group>
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

        if (email.match(this.space_regex)) {
            this.displayError("Email can't contain spaces");
            return;
        }
        if (pseudo.match(this.space_regex)) {
            this.displayError("Email can't contain spaces");
            return;
        }

        if (password.match(this.space_regex)) {
            this.displayError("Email can't contain spaces");
            return;
        }else if (password !== password_2) {
            this.displayError('Passwords must match !');
            return;
        }else if (!this.regex.test(password)) {
            this.displayError('Passwords must contain minimum 8 chars with 1 UPPER case, 1 lower case, 1 number and 1 spcial char.');
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

            this.displayError(message);
        }
    }
}

export default Signup;