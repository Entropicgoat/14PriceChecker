import React, { useMemo } from 'react';

import InfoRow from './infoRow';
import { useItemPrices } from '../hooks/useItemPrices';
import { cheapestSinglePurchase, cheapestSingleWorldPurchase, cheapestCombinedPurchase } from '../utils/prices';


type inputRowProps = {
  dataCenter: string;
}

const InputRow: React.FunctionComponent<inputRowProps> = ({ dataCenter }: inputRowProps) => {
  const { itemName, quantity, status, itemPrices, handleItemChange, handleQuantityChange, handleSubmit } = useItemPrices(dataCenter);

  const results = useMemo(() => ({
    single: cheapestSinglePurchase(itemPrices, quantity),
    singleWorld: cheapestSingleWorldPurchase(itemPrices, quantity),
    combined: cheapestCombinedPurchase(itemPrices, quantity),
  }), [itemPrices, quantity]);

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
      <input type='button' value='fetch data' onClick={handleSubmit}/>
      {status === 'loading' && <p className='greyText'>Fetching prices…</p>}
      {status === 'notFound' && <p className='greyText'>No item named "{itemName}" found.</p>}
      {status === 'error' && <p className='greyText'>Fetching prices failed — try again.</p>}
      {status === 'done' && (
        itemPrices.length === 0
          ? <p className='greyText'>No listings on {dataCenter} for this item.</p>
          : <InfoRow single={results.single} singleWorld={results.singleWorld} combined={results.combined} />
      )}
    </>
  )
}

export default InputRow;
