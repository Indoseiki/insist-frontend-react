export interface Country {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  phonecode: string;
  capital: string;
  currency: string;
  native: string;
  emoji: string;
}

export interface State {
  id: number;
  name: string;
  iso2: string;
}

export interface City {
  id: number;
  name: string;
  iso2: string;
}
