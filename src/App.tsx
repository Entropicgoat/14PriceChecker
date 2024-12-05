import { useState } from 'react';

import InputRow from './components/inputRow';
import { UniversalisMarketDataProvider } from './context/universalisMarketData';
// Images.
import meteor from '/14Meteor.png';
import universalisLogo from '/universalis.png';
// Syles.
import './App.css';


const App = () => {
  const [itemCount, setItemCount] = useState(1);

  const adjustCount = (newValue: number) => {
    setItemCount(newValue)
  }

  const inputRows: JSX.Element[] = [];

  for (let i = 0; i < itemCount; i++) {
    inputRows.push(
      <p key={i}>
        <InputRow />
      </p>
    )
  }

  return (
    <div className="App">
      <div>
        <img src={universalisLogo} className="logo" alt="Universalis logo" />
        <img src={meteor} className="logo vanilla" alt="Final Fantasy 14 meteor" />
        <h1>Final fantasy 14 price checker</h1>
        <p className="greyText">
          Powered by <a href="https://universalis.app/" target="_blank">universalis</a>
        </p>
      </div>
      <div>
        <UniversalisMarketDataProvider>
            <>{inputRows}</>
        </UniversalisMarketDataProvider>
        <br/>
        <button className='leftButton' onClick={() => {adjustCount(itemCount+1)}}>Add item</button>
        { itemCount > 1 && <button className='rightButton' onClick={() => {adjustCount(itemCount-1)}}>Remove item</button>}
      </div>
    </div>
  );
}

export default App;
