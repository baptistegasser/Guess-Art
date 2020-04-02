import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import PrivateRoute from './PrivateRoute';
import Home from "./Home/Home";
import Room from "./Room";
import Signup from './Connection/Signup';
import Signin from './Connection/Signin';

class App extends React.Component {
    render () {
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
        </BrowserRouter>);
    }
};

export default App;
