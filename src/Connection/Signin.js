import React from "react";
import { Form } from "react-bootstrap";
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import ConnectForm from './ConnectForm';
import Verification from '../Verification';
import { signIn } from '../store/actions';

/**
 * Map allowing to use the redux action to sign in
 */
const mapDispatchToProps = () => {
    return {
        signIn
    };
};

class SigninForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            rememberMe: false,
            success: false,
            destination: '/room', // Default destination is the room creation page
            error_msg: ''
        };

        // If the props "location.state.destination" is set, redirect to this specific destination
        if (this.props.location.state !== undefined && this.props.location.state.destination !== undefined) {
            this.state.destination = this.props.location.state.destination;
            this.state.error_msg = 'You need to login to access this page !';
        }

        this.handleChange = this.handleChange.bind(this);
        this.checkAndSubmit = this.checkAndSubmit.bind(this);
    }

    /**
     * Handle the changes of the input fields
     */
    handleChange(event) {
        if (event.target.type === 'checkbox') {
            this.setState({ [event.target.id]: event.target.checked });
        } else {
            this.setState({ [event.target.id]: event.target.value });
        }
    }

    render() {
        // If the login was successfull, redirect
        if (this.state.success) {
            return <Redirect to={ this.state.destination } />
        }

        return (
        <ConnectForm onSubmit={this.checkAndSubmit} submit_text='Sign in' error_msg={this.state.error_msg}>
            <Form.Group controlId='username'>
                <Form.Label>Username</Form.Label>
                <Form.Control
                    required
                    type="text"
                    placeholder="Enter your Username"
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
            <Form.Group controlId='rememberMe'>
                <Form.Check
                    type='switch'
                    label='Remember me'
                    value={this.state.rememberMe}
                    onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group>
                <Link to='/signup'>I don't have an account</Link>
            </Form.Group>
        </ConnectForm>
        )
    }

    /**
     * Check the datas before submiting the form
     */
    async checkAndSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        // Retrieve data to prevent change during handling
        const username = this.state.username;
        const password = this.state.password;
        const rememberMe = this.state.rememberMe;

        // Ensure the fields are valid
        if (!Verification.checkString(username, 'Username') || !Verification.checkString(password, 'Password')) {
            return this.setState({error_msg: Verification.getMessage() });
        }

        await this.submitForm(username, password, rememberMe);
    }

    /**
     * Handle the form submition to the API and the response
     */
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
            body: data,
            credentials: 'same-origin',
        });

        // If response is ok set success and signIn (Redux)
        if (response.ok) {
            this.props.signIn();
            this.setState({ success: true });
        } else {
            let message = 'Unknown error while sign in. If it keep happening, please contact an admin.';

            // If it's not a server error, retrieve the error message and diplay it
            if (response.status !== 500) {
                const json = await response.json();
                message = json.message;
            }
            this.setState({error_msg: message });
        }
    }
}

export default connect(
    null,
    mapDispatchToProps()
)(SigninForm);