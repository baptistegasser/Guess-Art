import React from 'react';
import {connect} from "react-redux";

const mapStateToProps = state => ({
    roomInfo: state.roomInfo
})

class RoomComponent extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
    }
}

export default connect(
    mapStateToProps,
    null,
)(RoomComponent);
