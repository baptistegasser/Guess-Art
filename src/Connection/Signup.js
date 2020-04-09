import React from "react";
import ConnectForm from './ConnectForm';
import { Form } from "react-bootstrap";
import { Link, Redirect } from 'react-router-dom';
import Verification from '../Verification';

class Signup extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            password_2: '',
            success: false,
            error_msg: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.checkAndSubmit = this.checkAndSubmit.bind(this);
    }

    /**
     * Handle the changes of the input fields
     */
    handleChange(event) {
        this.setState({ [event.target.id]: event.target.value });
    }

    render() {
        // If the account creation was successfull, redirect to sign in
        if (this.state.success) {
            return <Redirect to='/signin' />
        }

        return (
        <ConnectForm onSubmit={this.checkAndSubmit} submit_text='Sign me up !' error_msg={this.state.error_msg}>
            <Form.Group controlId='email'>
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                    required
                    type="email"
                    placeholder="Enter your e-mail address"
                    value={this.state.email}
                    onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group controlId='username'>
                <Form.Label>Username</Form.Label>
                <Form.Control
                    required
                    type="text"
                    placeholder="Enter your username"
                    value={this.state.username}
                    onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group controlId='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control
                    required
                    type="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group controlId='password_2'>
                <Form.Control
                    required
                    type="password"
                    placeholder="Validate your password"
                    value={this.state.password_2}
                    onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group>
                <Link to='/signin'>I already have an account</Link>
            </Form.Group>
        </ConnectForm>
        );
    }

    /**
     * Check the datas before submiting the form
     */
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
            return this.setState({error_msg: Verification.getMessage() });
        }

        await this.submitForm(email, username, password);
    }

    /**
     * Handle the form submition to the API and the response
     */
    async submitForm(email, username, password) {
        // Create the and send the signup request
        var data = new URLSearchParams();
        data.append('email', email);
        data.append('username', username);
        data.append('password', password);
        const response = await fetch('/api/v1/user/signup', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: data
        });

        // If response is ok redirect
        if (response.ok) {
            this.setState({ success: true });
        } else {
            let message = 'Unknown error while sign in. If it keep happening, please contact an admin.';

            // If it's not a server error, retrieve the message and display it
            if (response.status !== 500) {
                const json = await response.json();
                message = json.message;
            }
            this.setState({error_msg: message });
        }
    }
}

export default Signup;
