import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

const mapStateToProps = (state) => ({
    isLogged: state.isLogged,
});

class PrivateRoute extends Route {
    constructor(props) {
        super(props);
        this.state = {
            isLogged: false
        }
    }

    render() {
        // If the route don't match let the default route render handle it

        // If user is signed in, let the route render, else redirect
        if (this.props.isLogged) {
            return super.render();
        } else {
            return <Redirect to='/signin'/>
        }
    }
}

export default connect(
    mapStateToProps,
    null
)(PrivateRoute);
  