import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { connect } from 'react-redux';
import PrivateRoute from './PrivateRoute';
import Home from "./Home/Home";
import Room from "./Room";
import Signup from './Connection/Signup';
import Signin from './Connection/Signin';
import {signIn} from './store/actions'

const mapDispatchToProps = () => {
    return {
        signIn
    };
};

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true
        }

        this.getLoggedStatus = this.getLoggedStatus.bind(this);
        this.getLoggedStatus();
    }

    async getLoggedStatus() {
        const response = await fetch('/api/v1/isLogged');
        
        if (response.ok) {
            this.props.signIn();
        }
        
        this.setState({loading: false})
    }
    
    render () {
        if (this.state.loading) {
            return(<div><p>loading</p></div>);
        } else {
            return (
                <BrowserRouter>
                    <Switch>
                        <Route path='/' exact component={ Home }/>
                        <PrivateRoute path='/room' exact component={ Room }/>
                        <PrivateRoute path='/room/:id' exact component={ Room }/>
                        <Route path='/signin' exact component={ Signin }/>
                        <Route path='/signup' exact component={ Signup }/>
                        <Route path='/' render={() => <div>404 eror page</div> } />
                    </Switch>
                </BrowserRouter>
            );
        }
    }
};

export default connect(
    null,
    mapDispatchToProps()
)(App);
