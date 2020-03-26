import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./Home";
import Room from "./Room";

class App extends React.Component {
    render () {
        return (
        <BrowserRouter>
            <Switch>
                <Route path='/' exact component={ Home }/>
                <Route path='/room' exact component={ Room }/>
                <Route path='/room/:id' exact component={ Home }/>
                <Route path='/' render={() => <div>404 eror page</div> } />
            </Switch>
        </BrowserRouter>);
    }
};

export default App;
