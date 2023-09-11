import React, { createContext, ChangeEvent, useEffect, useState } from 'react';

// Enums
import { Light } from '../enums/dataCenter';
// Types
import { universalisListing } from '../types/universalis';
// Actions
import { getItemIds } from '../actions/getItemIds';
import { getItemPrices } from '../actions/getItemPrices';


type UniversalisMarketDataProviderProps = {
  children: JSX.Element,
};

const UniversalisMarketDataContext = createContext<any>({
  itemPrices: '',
  quantity: 1,
  handleItemChange: undefined,
  handleQuantityChange: undefined,
  handleSubmit: undefined

});

const UniversalisMarketDataProvider = ({children}: UniversalisMarketDataProviderProps) => {
  const [readyToFetch, setReadyToFetch] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemId, setItemId]= useState<number|undefined>();
  const [itemPrices, setItemPrices] = useState<universalisListing[]>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchItemPrices = async () => {
      if (itemId) {
        const prices = await getItemPrices(itemId);
        const lightServers = Object.values(`${Light}`);
        const lightPrices: universalisListing[] = [];
        prices.map((price) => {
          if (lightServers.includes(price.worldName.toLowerCase())) {
            lightPrices.push(price);
          }
        });
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
        if (item.UrlType.toLowerCase() === 'item' && item.Name.toLowerCase() === itemName.toLowerCase()) {
          setItemId(item.ID);
        }
        return undefined;
      });
      setReadyToFetch(false);
    }
    if (readyToFetch) {
      fetchItemIds();
    }
  }, [readyToFetch, itemName]);

  const handleItemChange = (event: ChangeEvent<HTMLInputElement>) => {
    setItemName(event.target.value);
    setItemId(undefined);
  }

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(event.target.value));
  }

  const handleSubmit = () => {
    setReadyToFetch(true)
  }

  return (
    <UniversalisMarketDataContext.Provider 
      value={{
        itemPrices,
        quantity,
        handleItemChange,
        handleQuantityChange,
        handleSubmit
      }}>
      {children}
    </UniversalisMarketDataContext.Provider>
  );
};

export { UniversalisMarketDataContext, UniversalisMarketDataProvider };
