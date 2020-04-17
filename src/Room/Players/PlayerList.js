import React from 'react';
import Player from './Player';
import {connect} from "react-redux";

const mapStateToProps = state => ({
    user: state.user
});

class PlayerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boss: null,
            players: []
        };

        this.props.socket.on('boss', boss => this.setState({ boss: boss }));
        this.props.socket.on('game_info', game_info => this.setState({ players: game_info.players }));
        this.props.socket.on('user_joined', player => this.addPlayer(player));
        this.props.socket.on('user_leaved', player => this.removePlayer(player));
    }

    addPlayer(player) {
        this.setState({
            players: [...this.state.players, player]
        });
    }

    removePlayer(player) {
        let newPlayers = this.state.players;
        let i = 0;
        for (; i < newPlayers.length; i++) {
            if (newPlayers[i].username === player.username) break;
        }
        newPlayers.splice(i, 1);
        this.setState({ players: newPlayers });
    }

    render() {
        const players = this.state.players.map(val => {
            return <Player key={val.username} pseudo={val.username} score={val.score} boss={val.username === this.state.boss}/>;
        });

        return (
            <div id="HboxPlayer">
                {players}
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    null,
)(PlayerList);
