import { universalisListing } from '../types/universalis';


export const cheapestSinglePurchase = (prices: universalisListing[], quantityString: string): universalisListing|undefined => {
  const quantity = parseInt(quantityString);
  let cheapestPriceSinglePurchase: universalisListing|undefined;

  prices.map((price) => {
    if (price.quantity >= quantity) {
      if (!cheapestPriceSinglePurchase) {
        cheapestPriceSinglePurchase = price;
      }
      else {
        const totalPrice = price.quantity * price.pricePerUnit;
        const storedTotalPrice = cheapestPriceSinglePurchase.quantity * cheapestPriceSinglePurchase.pricePerUnit;
        if (totalPrice < storedTotalPrice) {
          cheapestPriceSinglePurchase = price;
        }
      } 
    }
  });
  return cheapestPriceSinglePurchase;
}

export const cheapestCombinedPurchase = (prices: universalisListing[], quantityString: string): universalisListing[]|undefined => {
  const quantity = parseInt(quantityString);
  const smallQuantityArray: universalisListing[] = [];
  const adjustedKeys: number[] = [];
  const multiPurchaseArray: universalisListing[] = [];

  prices.map((price) => {
    if (price.quantity < quantity) {
      smallQuantityArray.push(price);
    }
  });

  let i = 0;
  let sum = 0;

  while (sum < quantity) {
    sum += smallQuantityArray[i].quantity;
    i += 1;
  }
  console.log('first sum', sum);
  console.log('smallQuantityArray', smallQuantityArray);
  i -= 0;
  
  if (sum > quantity) {
    while (i >= 0) {
      if (sum - smallQuantityArray[i].quantity >= quantity) {
        sum -= smallQuantityArray[i].quantity;
        adjustedKeys.push(i);
      }
      i -= 1;
    }
  }
  adjustedKeys.map((i) => {
    multiPurchaseArray.push(smallQuantityArray[i]);
  });
  console.log('final sum', sum);

  return multiPurchaseArray;
}