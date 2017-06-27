import React, { Component } from 'react';
import Gun from 'gun';
import Home from './Home';

class App extends Component {
  constructor() {
    super();
    this.gun = Gun(location.origin + '/gun');
  }

  render() {
    return (
        <Home gun={this.gun} />
    );
  }
}

export default App;
