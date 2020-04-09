import React from 'react';
import { Form } from "react-bootstrap";
import { Link, Redirect } from 'react-router-dom';
import ConnectForm from '../Connection/ConnectForm';

class RoomCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            max_player: 8,
            min_player_start: 4,
            round_duration: 45,
            round_count: 10,
            room_id: null,
            success: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.checkAndSubmit = this.checkAndSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.id]: event.target.value });
        if (event.target.id === 'max_player') {
            if (event.target.value < this.state.min_player_start) {
                this.setState({ min_player_start: event.target.value });
            }
        }
    }

    async checkAndSubmit(event) {
    }

    async submitForm(settings) {
    }

    render() {
        // If the login was successfull, redirect
        if (this.state.success) {
            return <Redirect to={ this.state.destination } />
        }

        return (
        <ConnectForm onSubmit={this.checkAndSubmit} submit_text='Create room' error_msg={this.state.error_msg}>

        <Form.Group controlId="max_player">
            <Form.Label>Max Players: <b>{this.state.max_player}</b></Form.Label>
            <Form.Control
            type="range"
            min="2"
            max="10"
            value={this.state.max_player}
            onChange={this.handleChange}/>
        </Form.Group>
        <Form.Group controlId="min_player_start">
            <Form.Label>Min player count to start a round: <b>{this.state.min_player_start}</b></Form.Label>
            <Form.Control
            type="range"
            min="2"
            max={this.state.max_player}
            value={this.state.min_player_start}
            onChange={this.handleChange}/>
        </Form.Group>
        <Form.Group controlId="round_duration">
            <Form.Label>Round duration (in seconds): <b>{this.state.round_duration}</b></Form.Label>
            <Form.Control
            type="range"
            min="30"
            max="180"
            value={this.state.round_duration}
            onChange={this.handleChange}/>
        </Form.Group>
        <Form.Group controlId="round_count">
            <Form.Label>Round count: <b>{this.state.round_count}</b></Form.Label>
            <Form.Control
                type="range"
                min="1"
                max="50"
                value={this.state.round_count}
                onChange={this.handleChange}/>
        </Form.Group>
        </ConnectForm>
        )
    }
}

export default RoomCreate;
