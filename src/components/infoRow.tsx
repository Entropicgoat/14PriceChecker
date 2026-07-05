import React from 'react';

import { universalisListing } from '../types/universalis';
import { purchasePlan, worldPurchasePlan, groupListingsByWorld } from '../utils/prices';


type infoProps = {
  single: universalisListing|undefined;
  singleWorld: worldPurchasePlan|undefined;
  combined: purchasePlan|undefined;
}

const InfoRow: React.FunctionComponent<infoProps> = (props: infoProps) => {
  const { single, singleWorld, combined } = props;

  if (!single && !singleWorld && !combined) {
    return <p>Not enough listings to cover that quantity.</p>;
  }

  // Only worth showing the multi-world plan when it actually beats staying on
  // one server (or no single server can cover the quantity).
  const combinedIsBetter = combined && (!singleWorld || combined.totalCost < singleWorld.totalCost);

  return (
    <div>
      {single &&
        <p>Cheapest single listing: {single.pricePerUnit * single.quantity} gil for {single.quantity} on {single.worldName}</p>}
      {singleWorld &&
        <p>
          Cheapest single server: {singleWorld.totalCost} gil for {singleWorld.totalQuantity} on {singleWorld.worldName}
          &nbsp;({singleWorld.listings.length} {singleWorld.listings.length === 1 ? 'listing' : 'listings'})
        </p>}
      {combinedIsBetter &&
        <>
          <p>Cheapest combined: {combined.totalCost} gil for {combined.totalQuantity} across:</p>
          <ul>
            {Object.entries(groupListingsByWorld(combined.listings)).map(([worldName, listings]) => (
              <li key={worldName}>
                {worldName}: {listings.reduce((sum, l) => sum + l.pricePerUnit * l.quantity, 0)} gil
                &nbsp;for {listings.reduce((sum, l) => sum + l.quantity, 0)} ({listings.length} {listings.length === 1 ? 'listing' : 'listings'})
              </li>
            ))}
          </ul>
        </>}
    </div>
  )
}

export default InfoRow;
