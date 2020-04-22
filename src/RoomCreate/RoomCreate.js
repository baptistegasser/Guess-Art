import React from 'react';
import { Form, Table } from "react-bootstrap";
import { Link, Redirect } from 'react-router-dom';
import ConnectForm from '../Connection/ConnectForm';
import './RoomCreate.css';

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
            errorMessage: '',
        }

        if (props.location.state !== undefined && props.location.state.errorMessage !== undefined) {
            this.state.errorMessage = props.location.state.errorMessage;
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
        event.preventDefault();
        event.stopPropagation();
        try {
            const id    = event.target.id;
            const value = Number(event.target.value);

            this.setState({ [id]: value });
            if (id === 'max_player' && value < this.state.min_player_start) {
                this.setState({ min_player_start: value });
            }
        } catch(error) {
            return;
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

    createRoomTable() {
        let room_table = []
        for (let i = 0; i < this.state.room_list.length; ) {
            let element;
            if (i + 1 < this.state.room_list.length) {
                element = <tr key={i}><td>{this.createRoomLink(this.state.room_list[i])}</td><td>{this.createRoomLink(this.state.room_list[i+1])}</td></tr>;
            } else {
                element = <tr key={i}><td>{this.createRoomLink(this.state.room_list[i])}</td><td></td></tr>;
            }

            room_table.push(element);
            i+=2;
        }

        return room_table;
    }

    createRoomLink(val) {
        return <p><Link to={'/room/'+val.id}>{val.id}</Link>: {val.playerCount}/{val.maxPlayerCount} players</p>
    }

    render() {
        // If the login was successfull, redirect
        if (this.state.success) {
            return <Redirect to={ '/room/'+this.state.room_id } />
        }

        return (
            <ConnectForm onSubmit={this.checkAndSubmit} submit_text='Create room' error_msg={this.state.errorMessage}>
                {this.state.room_list.length > 0 ?
                <div className="table-container">
                    <Table>
                        <tbody>
                            {this.createRoomTable()}
                        </tbody>
                    </Table>
                    <hr/>
                </div>
                :''}
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
