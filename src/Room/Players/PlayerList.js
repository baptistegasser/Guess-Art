import React from 'react';
import Player from './Player';
import {RoomComponent, connectRoomComponent} from '../RoomComponent';

class PlayerList extends RoomComponent {
    constructor(props) {
        super(props);
        this.props.socket.on('guess_success', (data) => this.displayGuessSuccess(data));
        this.props.socket.on('game_end', () => this.resetList());
        this.props.socket.on('round_end', () => this.resetList());
        this.state = {listPlayerWhoGuess : []}
        this.displayGuessSuccess.bind(this)
        this.resetList.bind(this)
    }

    displayGuessSuccess(data)
    {
        this.state.listPlayerWhoGuess.push(data.username)
        this.setState({listPlayerWhoGuess : this.state.listPlayerWhoGuess})
    }

    resetList()
    {
        this.setState({listPlayerWhoGuess:[]})
        console.log(this.state.listPlayerWhoGuess)
    }

    render() {
        const players = this.props.roomInfo.players.map(val => {
            return <Player key={val.username} pseudo={val.username} score={val.score} boss={val.username === this.props.roomInfo.boss} hasGuessed={this.state.listPlayerWhoGuess.includes(val.username)}/>;
        });

        return (
            <div id="player-list">
                {players}
            </div>
        );
    }
}

export default connectRoomComponent(PlayerList);
