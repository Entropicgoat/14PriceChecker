type xivApiIcon = {
  id: number;
  path: string;
  path_hr1: string;
}

type xivApiFieldsBeta = {
  Icon: xivApiIcon;
  Name: string;
  Singular: string;
};

export type xivApiResultsBeta = {
  score: number;
  sheet: string;
  row_id: number;
  fields: xivApiFieldsBeta;
};

export type xivApiResponseBeta = {
  schema: string;
  results: xivApiResultsBeta[];
};
