import React from 'react';
import { Form, Container } from "react-bootstrap";
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
            room_list: [],
            room_id: null,
            success: false,
            error_msg: '',
        }

        this.getRoomList = this.getRoomList.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.checkAndSubmit = this.checkAndSubmit.bind(this);
    }

    componentDidMount() {
        this.getRoomList();
    }

    async getRoomList() {
        const response = await fetch('/api/v1/room');

        if (response.ok) {
            const room_list = await response.json();
            this.setState({ room_list: room_list });
        }
    }

    handleChange(event) {
        this.setState({ [event.target.id]: event.target.value });
        if (event.target.id === 'max_player') {
            if (event.target.value < this.state.min_player_start) {
                this.setState({ min_player_start: event.target.value });
            }
        }
    }

    checkAndSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const settings = {
            max_player: this.state.max_player,
            min_player_start: this.state.min_player_start,
            round_duration: this.state.round_duration,
            round_count: this.state.round_count,
        }

        this.submitForm(settings);
    }

    async submitForm(settings) {
        // Create the and send the room creation request
        var data = new URLSearchParams();
        data.append('settings', JSON.stringify(settings));
        const response = await fetch('/api/v1/room/create', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: data,
            credentials: 'same-origin',
        });

        const json = await response.json();

        // If response is ok set success and redirect to the room
        if (response.ok) {
            this.setState({ success: true, room_id: json.id });
        } else {
            const message = json.message ? json.message : 'Unknown error while creating the room. If it keep happening, please contact an admin.';
            this.setState({error_msg: message });
        }
    }

    render() {
        // If the login was successfull, redirect
        if (this.state.success) {
            return <Redirect to={ '/room/'+this.state.room_id } />
        }

        const room_list = this.state.room_list.map(val => {
            return (
            <li key={val.id}>
                <p><Link to={'/room/'+val.id}>{val.id}</Link>: {val.playerCount}/{val.maxPlayerCount} players</p>
            </li>
            );
        });

        return (
            <>
                <Container>
                    {room_list}
                </Container>
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
            </>
        )
    }
}

export default RoomCreate;
