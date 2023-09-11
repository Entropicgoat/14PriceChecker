export type xivApiResults = {
  ID: number,
  Icon: string,
  Name: string,
  Url: string,
  UrlType: string,
  _: string,
  _Score: number
}

export type xivApiResponse = {
  Pagination: {
    Page: number,
    PageNext: number|null,
    PagePrev: number|null,
    PageTotal: number,
    Results: number,
    ResultsPerPage: number,
    ResultsTotal: number
  },
  Results: xivApiResults[],
  SpeedMs: number
}