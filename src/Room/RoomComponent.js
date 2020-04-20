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
    setBoss(...args) {
        this.props.setBoss(...args);
    }

    setIsBoss(...args) {
        this.props.setIsBoss(...args);
    }

    addPlayer(...args) {
        this.props.addPlayer(...args);
    }

    removePlayer(...args) {
        this.props.removePlayer(...args);
    }

    setTool(...args) {
        this.props.setTool(...args);
    }

    setWidth(...args) {
        this.props.setWidth(...args);
    }

    setColor(...args) {
        this.props.setColor(...args);
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps(),
)(RoomComponent);
