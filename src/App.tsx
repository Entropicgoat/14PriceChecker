import React from 'react';
import logo from './logo.svg';
import './App.css';

import InputRow from './components/inputRow';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <InputRow />
        </p>
        <p>
          <InputRow />
        </p>
        <p>
          <InputRow />
        </p>
      </header>
    </div>
  );
}

export default App;
