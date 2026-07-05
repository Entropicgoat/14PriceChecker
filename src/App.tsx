import { useEffect, useState } from 'react';

import InputRow from './components/inputRow';
import { getDataCenters } from './actions/getDataCenters';
import { universalisDataCenter } from './types/universalis';
// Images.
import meteor from '/14Meteor.png';
import universalisLogo from '/universalis.png';
// Syles.
import './App.css';


// Used until the live list loads (or if it fails) so the app stays usable.
const fallbackDataCenters: universalisDataCenter[] = [
  { name: 'Aether', region: 'North-America', worlds: [] },
  { name: 'Primal', region: 'North-America', worlds: [] },
  { name: 'Crystal', region: 'North-America', worlds: [] },
  { name: 'Dynamis', region: 'North-America', worlds: [] },
  { name: 'Chaos', region: 'Europe', worlds: [] },
  { name: 'Light', region: 'Europe', worlds: [] },
  { name: 'Elemental', region: 'Japan', worlds: [] },
  { name: 'Gaia', region: 'Japan', worlds: [] },
  { name: 'Mana', region: 'Japan', worlds: [] },
  { name: 'Meteor', region: 'Japan', worlds: [] },
  { name: 'Materia', region: 'Oceania', worlds: [] },
];

const App = () => {
  const [itemCount, setItemCount] = useState(1);
  const [dataCenter, setDataCenter] = useState('Light');
  const [dataCenters, setDataCenters] = useState<universalisDataCenter[]>(fallbackDataCenters);

  useEffect(() => {
    const fetchDataCenters = async () => {
      try {
        const centers = await getDataCenters();
        if (centers.length > 0) {
          setDataCenters(centers);
        }
      } catch {
        // Keep the fallback list.
      }
    }
    fetchDataCenters();
  }, []);

  const adjustCount = (newValue: number) => {
    setItemCount(newValue)
  }

  const inputRows: JSX.Element[] = [];

  for (let i = 0; i < itemCount; i++) {
    inputRows.push(
      <p key={i}>
        <InputRow dataCenter={dataCenter} />
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
          Powered by <a href="https://universalis.app/" target="_blank">universalis</a> and
          <a href="https://beta.xivapi.com/api/1/docs" target="_blank">XIVAPI</a>
        </p>
      </div>
      <div>
        <label>
          Data center:&nbsp;
          <select value={dataCenter} onChange={(event) => setDataCenter(event.target.value)}>
            {dataCenters.map((center) => (
              <option key={center.name} value={center.name}>
                {center.name} ({center.region})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        {inputRows}
        <br/>
        <button className='leftButton' onClick={() => {adjustCount(itemCount+1)}}>Add item</button>
        { itemCount > 1 && <button className='rightButton' onClick={() => {adjustCount(itemCount-1)}}>Remove item</button>}
      </div>
    </div>
  );
}

export default App;
