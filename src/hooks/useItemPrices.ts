import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { getItemIds } from '../actions/getItemIds';
import { getItemPrices } from '../actions/getItemPrices';
import { universalisListing } from '../types/universalis';


export type fetchStatus = 'idle' | 'loading' | 'notFound' | 'error' | 'done';

// One item row's full flow: name -> XIVAPI exact match -> Universalis prices
// for the selected data center.
export const useItemPrices = (dataCenter: string) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState<fetchStatus>('idle');
  const [itemPrices, setItemPrices] = useState<universalisListing[]>([]);

  // Bumped whenever current results become invalid (new submit, name edit,
  // data center switch) so an in-flight fetch can't overwrite newer state.
  const requestId = useRef(0);

  // Results are per data center; switching invalidates them (render-time
  // reset, per React's derived-state pattern).
  const [prevDataCenter, setPrevDataCenter] = useState(dataCenter);
  if (prevDataCenter !== dataCenter) {
    setPrevDataCenter(dataCenter);
    setStatus('idle');
    setItemPrices([]);
  }

  useEffect(() => {
    requestId.current++;
  }, [dataCenter]);

  const handleItemChange = (event: ChangeEvent<HTMLInputElement>) => {
    setItemName(event.target.value);
    setStatus('idle');
    setItemPrices([]);
    requestId.current++;
  }

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuantity(event.target.value);
  }

  const handleSubmit = async () => {
    const name = itemName.trim();
    if (!name) {
      return;
    }
    setStatus('loading');
    const id = ++requestId.current;
    try {
      const items = await getItemIds(name);
      if (id !== requestId.current) {
        return;
      }
      const match = items.find((item) =>
        item.sheet.toLowerCase() === 'item' && item.fields.Name.toLowerCase() === name.toLowerCase()
      );
      if (!match) {
        setItemPrices([]);
        setStatus('notFound');
        return;
      }
      const prices = await getItemPrices(match.row_id, dataCenter);
      if (id !== requestId.current) {
        return;
      }
      setItemPrices(prices);
      setStatus('done');
    } catch {
      if (id !== requestId.current) {
        return;
      }
      setItemPrices([]);
      setStatus('error');
    }
  }

  return { itemName, quantity, status, itemPrices, handleItemChange, handleQuantityChange, handleSubmit };
}
