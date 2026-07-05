export type universalisDataCenter = {
  name: string;
  region: string;
  worlds: number[];
}

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
  listingID: string;
  materia: { slotID: number; materiaID: number }[];
  onMannequin: boolean;
  pricePerUnit: number;
  quantity: number;
  retainerCity: number;
  retainerID: string;
  retainerName: string;
  sellerID: null|string;
  stainID: number;
  tax: number;
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
  stackSizeHistogram: Record<string, number>;
  stackSizeHistogramHQ: Record<string, number>;
  stackSizeHistogramNQ: Record<string, number>;
  unitsForSale: number;
  unitsSold: number;
  worldUploadTimes: Record<string, number>;
}