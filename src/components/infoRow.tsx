import React, { useState, useEffect, ChangeEvent } from 'react';

import { universalisListing } from '../types/universalis';


type infoProps = {
  priceDetails: universalisListing,
  multiPrice: universalisListing[]|undefined
}

const InfoRow: React.FunctionComponent<infoProps> = (props: infoProps) => {
  const {priceDetails, multiPrice} = props;
  let summedPrice: number = 0;
  let summedCount: number = 0;

  const totalPrice = priceDetails.pricePerUnit * priceDetails.quantity;
  if (multiPrice) {
    multiPrice.map((price) => {
      summedPrice += (price.pricePerUnit * price.quantity);
      summedCount += price.quantity;
    })
  }

  return(
    <div>
      <p>Cheapest single purchase: {totalPrice} gil for {priceDetails.quantity} on {priceDetails.worldName}</p>
      {summedPrice > 0 && summedCount > 0 && <p>Or {summedPrice} gil for {summedCount} on {priceDetails.worldName}</p>}
    </div>
  )
}

export default InfoRow;
