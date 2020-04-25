import React from 'react';
import Player from './Player';
import {RoomComponent, connectRoomComponent} from '../RoomComponent';

class PlayerList extends RoomComponent {
    render() {
        const players = this.props.roomInfo.players.map(val => {
            return <Player key={val.username} pseudo={val.username} score={val.score} boss={val.username === this.props.roomInfo.boss}/>;
        });

        return (
            <div id="player-list">
                {players}
            </div>
        );
    }
}

export default connectRoomComponent(PlayerList);
