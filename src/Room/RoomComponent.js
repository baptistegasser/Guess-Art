import React from 'react';
import {connect} from "react-redux";
import {resetRoomInfos, setBoss, setIsBoss, addPlayer, removePlayer, setPlayerScore, resetPlayersScores, setTool, setWidth, setColor} from '../store/actions/room';

const mapStateToProps = state => ({
    roomInfo: state.roomInfo
});

const mapDispatchToProps = () => {
    return {
        resetRoomInfos,
        setBoss,
        setIsBoss,
        addPlayer,
        removePlayer,
        setPlayerScore,
        resetPlayersScores,
        setTool,
        setWidth,
        setColor
    };
};

/**
 * A simple extention of React Component class allowing to access function to modify
 * the state of a room which is stored in Redux.
 */
export class RoomComponent extends React.Component {
    resetRoomInfos(...args) {
        this.props.resetRoomInfos(...args);
    }

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

    setPlayerScore(...args) {
        this.props.setPlayerScore(...args);
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

    resetPlayersScores(...args) {
        this.props.resetPlayersScores(...args);
    }
}

/**
 * Similar to the Redux connect() function this functio allow to connect a component to
 * the map defined for a RoomComponent AND arbitrary maps allowing to connect to more than room functions
 * @param {Function} _stateToProps The arbitrary function mapping state to props
 * @param {Function | Object} _dispatchToProps The arbitrary
 * @param {React.Component} component The component to connect.
 * @see {@link connectRoomComponent}
 */
export function extendedRoomConnect(_stateToProps, _dispatchToProps, component) {
    let final_stateToProps = mapStateToProps;
    if (_stateToProps !== null) {
        final_stateToProps = state => ({
            ...mapStateToProps(state),
            ..._stateToProps(state)
        });
    }

    let final_dispatchToProps = mapDispatchToProps();
    if (_dispatchToProps != null) {
        const extractedDispatch = (_dispatchToProps instanceof Function) ? _dispatchToProps() : _dispatchToProps;
        final_dispatchToProps = {
            ...final_dispatchToProps,
            ...extractedDispatch,
        };
    }

    return connect(
        final_stateToProps,
        final_dispatchToProps,
    )(component);
}

/**
 * Method to connect() a Component (preferably a RoomComponent) to the Redux props and functions
 * @param {RoomComponent | React.Component} component The component to connect.
 * @see {@link extendedRoomConnect}
 */
export function connectRoomComponent(component){
    return connect(
        mapStateToProps,
        mapDispatchToProps(),
    )(component);
}

export default connectRoomComponent(RoomComponent);
