import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
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
                <Route path='/room' exact component={ Room }/>
                <Route path='/room/:id' exact component={ Home }/>
                <Route path='/signin' exact component={ Signin }/>
                <Route path='/signup' exact component={ Signup }/>
                <Route path='/' render={() => <div>404 eror page</div> } />
            </Switch>
        </BrowserRouter>);
    }
};

export default App;