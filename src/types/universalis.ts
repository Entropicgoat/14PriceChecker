type recentHistory = {
  buyerName: string;
  hq: boolean;
  onMannequin: boolean;
  pricePerUnit: number;
  quantity: number;
  timestamp: number;
  total: number;
  worldID: number;
  worldName: string;
}

export type universalisListing = {
  creatorID: null|number;
  creatorName: string;
  hq: boolean;
  isCrafted: boolean;
  lastReviewTime: number;
  listingId: string;
  materia: [];
  onMannequin: boolean;
  pricePerUnit: number;
  quantity: number;
  retainerCity: number;
  retainerId: string;
  retainerName: string;
  sellerID: string;
  stainID: number;
  total: number;
  worldID: number;
  worldName: string;
}

export type universalisPriceResponse = {
  averagePrice: number;
  averagePriceHQ: number;
  averagePriceNQ: number;
  currentAveragePrice: number;
  currentAveragePriceHQ: number;
  currentAveragePriceNQ: number;
  hqSaleVelocity: number;
  itemID: number;
  lastUploadTime: number;
  listings: universalisListing[];
  listingsCount: number;
  maxPrice: number;
  maxPriceHQ: number;
  maxPriceNQ: number;
  minPrice: number;
  minPriceHQ: number;
  minPriceNQ: number;
  nqSaleVelocity: number;
  recentHistory: recentHistory[];
  recentHistoryCount: number;
  regionName: string;
  regularSaleVelocity: number;
  stackSizeHistogram: any;
  stackSizeHistogramHQ: any;
  stackSizeHistogramNQ: any;
  unitsForSale: number;
  unitsSold: number;
  worldUploadTimes: any
}