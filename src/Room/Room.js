import React from 'react';
import './Room.css';
import Canvas from "./Canvas/Canvas.js";
import PlayerList from './Players/PlayerList'
import Chrono from "./Chrono/Chrono";
import { Container, Row, Col, Button } from "react-bootstrap";
import Chat from "./Chat/Chat";
import {getUsername} from '../store/actions'
import ToolBar from './ToolBar/ToolBar'
import { RoomComponent, extendedRoomConnect } from './RoomComponent';
import { Redirect } from 'react-router-dom';
const socketIo = require("socket.io-client");

const mapStateToProps = state => (
    {
        user: state.user
    }
)

const mapDispatchToProps = () => {
    return {
        getUsername
    };
};

class Room extends RoomComponent {
    constructor(props) {
        super(props);
        this.socket = socketIo();
        this.state = {
            mysteryWord: '',
            leaving: false,
            errorMessage: undefined,
            roundStarted: false,
            roundDuration: -1
        };

        this.leaveRoom    = this.leaveRoom.bind(this);
        this.onRoundStart = this.onRoundStart.bind(this);
        this.onRoundEnd   = this.onRoundEnd.bind(this);
        this.onGameInfo   = this.onGameInfo.bind(this);
        this.onGameStart  = this.onGameStart.bind(this);
        this.onGameEnd    = this.onGameEnd.bind(this);

        this.chronoRef = React.createRef();
    }

    leaveRoom() {
        this.socket.emit("leave_room");
        this.socket.off('disconnect');
        if (this.socket.connected) this.socket.disconnect();
        this.setState({ leaving: true });
    }

    leaveOnError(errorMessage) {
        this.socket.emit("leave_room");
        this.socket.off('disconnect');
        if (this.socket.connected) this.socket.disconnect();
        this.setState({ leaving: true, errorMessage: errorMessage });
    }

    onRoundStart(infos) {
        this.setBoss(infos.boss);
        this.setIsBoss(infos.boss === this.props.user);
        this.setState({ roundStarted: true, mysteryWord: infos.mysteryWord});
        this.chronoRef.current.startChrono(this.state.roundDuration);
    }

    onRoundEnd(infos) {
        this.setIsBoss(false);
        this.setState({ mysteryWord: undefined, roundStarted: false });
        for (let player of infos.players) {
            this.setPlayerScore(player.username, player.score);
        }
        this.chronoRef.current.stopChrono();
    }

    onGameInfo(infos) {
        // Add all the player to the list
        infos.players.map(player => this.addPlayer(player));
        this.setState({ roundDuration: infos.roundDuration });

        // Actions if the game started
        if (infos.gameStarted === true) {
            this.setIsBoss(infos.boss);
            this.setIsBoss(infos.boss === this.props.user);
            this.setState({ roundStarted: true, mysteryWord: infos.mysteryWord});
            this.chronoRef.current.startChrono(infos.timeRemaining);
        }
    }

    onGameStart(infos) {
        this.resetPlayersScores();
    }

    onGameEnd(infos) {
        this.chronoRef.current.stopChrono();
        this.setIsBoss(false);
        this.setState({ mysteryWord: undefined, roundStarted: false });
    }

    componentWillUnmount() {
        // Clear the room infos stored in redux
        this.resetRoomInfos();
        if (this.socket.connected) this.socket.disconnect();
    }

    /**
     * Once the component is mounted we can start to listen for events
     */
    componentDidMount() {
        // Clear the room infos stored in redux
        this.resetRoomInfos();

        const room_id = window.location.pathname.replace('/room/','');
        this.socket.on("connect",()=>{this.socket.emit("join_room", room_id)});
        this.socket.on('game_error', (msg) => this.leaveOnError(msg));

        this.socket.on('user_joined', (player) => this.addPlayer(player));
        this.socket.on('user_leaved', (player) => this.removePlayer(player));
        this.socket.on('round_start', (infos) => this.onRoundStart(infos));
        this.socket.on('round_end',   (infos) => this.onRoundEnd(infos));
        this.socket.on('game_info',   (infos) => this.onGameInfo(infos));
        this.socket.on('game_start',  (infos) => this.onGameStart(infos));
        this.socket.on('game_end',    (infos) => this.onGameEnd(infos));
        this.socket.on('disconnect',  (reason) => {
            if (reason === 'transport error') {
                this.leaveOnError('Sorry, it seem the server crashed !');
            } else {
                console.error(reason);
                this.leaveOnError('Something happened that closed your connection.');
            }
        });
        window.onbeforeunload = () => {
            this.socket.off('disconnect');
        }
    }

    render() {
        if (this.state.leaving === true) {
            return <Redirect to={{
                pathname: '/room',
                state: {
                    errorMessage: this.state.errorMessage
                }
            }}/>
        }

        return (
            <Container fluid className="h-100 p-0">
                <Row id='topBar-wrapper'>
                    <Col>
                        <Row id="topBar">
                            <Col xs={4}>
                                <Chrono ref={this.chronoRef} displayStyle={this.state.roundStarted ? '' : 'hidden'}/>
                            </Col>
                            <Col xs={6}>
                                <h2 style={{paddingLeft:"20%"}}>{this.state.mysteryWord} </h2>
                            </Col>
                            <Col xs={2} style={{ textAlign: 'right' }}>
                                <Button onClick={this.leaveRoom} className="bg-secondary">Leave the room</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className='main h-100'>
                    <Col xs={2} style={{height: '80%'}}>
                        <PlayerList/>
                    </Col>
                    <Col xs={8} style={{height: '80%'}}>
                        <Canvas socket={this.socket}/>
                    </Col>
                    <Col xs={2} style={{height: '80%'}}>
                        <Chat socket={this.socket}/>
                    </Col>
                    <Col xs={{ span: 7, offset: 3 }} style={{height: '20%'}}>
                        {this.props.roomInfo.isBoss ? <ToolBar socket={this.socket}/> : '' }
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default extendedRoomConnect(mapStateToProps, mapDispatchToProps(), Room);
