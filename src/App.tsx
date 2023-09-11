import React from 'react';
import logo from './logo.svg';
import './App.css';

import InputRow from './components/inputRow';
import { UniversalisMarketDataProvider } from './context/universalisMarketData';

function App() {
  const itemCount = 5;

  const inputRows = Array(itemCount).fill(0).map(() => {
    return (
      <p>
        <InputRow />
      </p>
    )
  });

  return (
    <div className="App">
      <header className="App-header">
        <UniversalisMarketDataProvider>
          <>{inputRows}</>
        </UniversalisMarketDataProvider>
      </header>
    </div>
  );
}

export default App;
