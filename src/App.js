import React from 'react';
import './App.css';
import Canvas from "./Canvas.js";
import Player from "./Player";


function App() {
  return (

      <div>
          <div id="HboxPlayer"><Player pseudo="LaTeuTeu" score="1500" boss="true"></Player><Player pseudo="darsk" score="200" boss="false"></Player></div>
          <div id="Canvas"><Canvas id="canvas"></Canvas></div>

      </div>


  );
}

export default App;
