import React, { useState, useEffect, ChangeEvent } from 'react';

import { getItemIds } from '../actions/getItemIds';
import { getItemPrices } from '../actions/getItemPrices';

import { cheapestSinglePurchase, cheapestCombinedPurchase } from '../utils/prices';

import { universalisListing } from '../types/universalis';
import InfoRow from './infoRow';

const lightDataCenter = ['alpha', 'lich', 'odin', 'phoenix', 'raiden', 'shiva', 'twintania', 'zodiark'];

const InputRow: React.FunctionComponent = () => {
  const [readyToFetch, setReadyToFetch] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemId, setItemId]= useState<number|undefined>();
  const [itemPrices, setItemPrices] = useState<universalisListing[]>();
  const [quantity, setQuantity] = useState('1');
  const [alphaItems, setAlphaItems] =useState<universalisListing[]>();
  const [lichItems, setLichItems] =useState<universalisListing[]>();
  const [odinItems, setOdinItems] =useState<universalisListing[]>();
  const [phoenixItems, setPhoenixItems] =useState<universalisListing[]>();
  const [raidenItems, setRaidenItems] =useState<universalisListing[]>();
  const [shivaItems, setShivaItems] =useState<universalisListing[]>();
  const [twintaniaItems, setTwintaniaItems] =useState<universalisListing[]>();
  const [zodiarkItems, setZodiarkItems] =useState<universalisListing[]>();
  const [cheapestRaiden, setCheapestRaiden] = useState<universalisListing>();
  const [cheapestMultiRaiden, setCheapestMultiRaiden] = useState<universalisListing[]>();

  useEffect(() => {
    const fetchItemPrices = async () => {
      if (itemId) {
        const prices = await getItemPrices(itemId);
        const lightPrices: universalisListing[] = [];
        prices.map((price) => {
          if (lightDataCenter.includes(price.worldName.toLowerCase())) {
            lightPrices.push(price);
          }
        });
        const alpha: universalisListing[] = [];
        const lich: universalisListing[] = [];
        const odin: universalisListing[] = [];
        const phoenix: universalisListing[] = [];
        const raiden: universalisListing[] = [];
        const shiva: universalisListing[] = [];
        const twintania: universalisListing[] = [];
        const zodiark: universalisListing[] = [];
        lightPrices.map((price) => {
          switch (price.worldName.toLowerCase()) {
            case 'alpha': {
              alpha.push(price);
              break;
            }
            case 'lich': {
              lich.push(price);
              break;
            }
            case 'odin': {
              odin.push(price);
              break;
            }
            case 'phoenix': {
              phoenix.push(price);
              break;
            }
            case 'raiden': {
              raiden.push(price);
              break;
            }
            case 'shiva': {
              shiva.push(price);
              break;
            }
            case 'twintania': {
              twintania.push(price);
              break;
            }
            case 'zodiark': {
              zodiark.push(price);
              break;
            }
          }
        });
        setAlphaItems(alpha);
        setLichItems(lich);
        setOdinItems(odin);
        setPhoenixItems(phoenix);
        setRaidenItems(raiden);
        setShivaItems(shiva);
        setTwintaniaItems(twintania);
        setZodiarkItems(zodiark);
        setItemPrices(lightPrices);
      }
    }
    if (itemId) {
      fetchItemPrices();
    }
  }, [itemId]);

  useEffect(() => {
    const fetchItemIds = async () => {
      const items = await getItemIds(itemName);
      items.map((item) => {
        if (item.fields.Name.toLowerCase() === itemName.toLowerCase()) {
          setItemId(item.row_id);
        }
      });
      setReadyToFetch(false);
    }
    if (readyToFetch) {
      fetchItemIds();
    }
  }, [readyToFetch, itemName]);

  useEffect(() => {
    if (raidenItems) {
      //const cheapestRaiden = cheapestSinglePurchase(raidenItems, quantity);
      //const cheapestMulti = cheapestCombinedPurchase(raidenItems, quantity);
      //setCheapestRaiden(cheapestRaiden);
      //setCheapestMultiRaiden(cheapestMulti);
    }
  }, [raidenItems, quantity]);

  const handleItemChange = (event: ChangeEvent<HTMLInputElement>) => {
    setItemName(event.target.value);
    setItemId(undefined);
  }

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuantity(event.target.value);
  }

  const handleSubmit = () => {
    setReadyToFetch(true)
  }

  return (
    <>
      <label>
        Item name:
        <input type='text' name='itemName' value={itemName} onChange={handleItemChange}/>
      </label>
      <label>
        Quantity:
        <input type='text' name='quantity' value={quantity} onChange={handleQuantityChange}/>
      </label>
      {!itemId && <input type='button' value='fetch data' onClick={handleSubmit}/>}
      {itemId && itemPrices?.length === 0 && <label>{itemId}</label>}
      
    </>
  )
}

export default InputRow;
