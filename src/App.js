import React from 'react';
import { connect } from 'react-redux';
import {signIn, setUsername} from './store/actions'
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Room from "./Room/Room";
import Home from "./Home/Home";
import Loader from './Loader/Loader';
import RoomCreate from "./RoomCreate/RoomCreate";
import Page404 from './Errors/404';
import { Signin, Signup, PrivateRoute } from './Connection';

const mapStateToProps = state => ({
    isLogged: state.isLogged
});

const mapDispatchToProps = () => {
    return {
        signIn, setUsername
    };
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }

        if (props.isLogged !== true) {
            this.getLoggedStatus.bind(this)();
        } else {
            this.state.loading = false;
        }
    }

    async getLoggedStatus() {
        const response = await fetch('/api/v1/user/user');


        if (response.ok) {
            const json = await response.json()
            if (json.logged === true)
            {
                this.props.signIn();
                this.props.setUsername(json.user.username);
            }

        }

        this.setState({loading: false})
    }

    render () {
        if (this.state.loading) {
            return <Loader></Loader>;
        } else {
            return (
                <BrowserRouter>
                    <Switch>
                        <Route path='/' exact component={ Home }/>
                        <PrivateRoute path='/room' exact component={ RoomCreate }/>
                        <PrivateRoute path='/room/:id' exact component={ Room }/>
                        <Route path='/signin' exact component={ Signin }/>
                        <Route path='/signup' exact component={ Signup }/>
                        <Route path='/' component={ Page404 } />
                    </Switch>
                </BrowserRouter>
            );
        }
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps()
)(App);
