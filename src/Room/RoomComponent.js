import React from 'react';
import {connect} from "react-redux";
import {setBoss, setIsBoss, addPlayer, removePlayer, setTool, setWidth, setColor} from '../store/actions/room';

const mapStateToProps = state => ({
    roomInfo: state.roomInfo
});

const mapDispatchToProps = () => {
    return {
        setBoss,
        setIsBoss,
        addPlayer,
        removePlayer,
        setTool,
        setWidth,
        setColor
    };
};

class RoomComponent extends React.Component {
    setBoss() {
        this.props.setBoss();
    }

    setIsBoss() {
        this.props.setIsBoss();
    }

    addPlayer() {
        this.props.addPlayer();
    }

    removePlayer() {
        this.props.removePlayer();
    }

    setTool() {
        this.props.setTool();
    }

    setWidth() {
        this.props.setWidth();
    }

    setColor() {
        this.props.setColor();
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps(),
)(RoomComponent);
