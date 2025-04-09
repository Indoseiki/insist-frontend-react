import axios from "axios";
import { Country, State } from "../types/country";

const url = "https://api.countrystatecity.in/v1/countries";
const apiKey = "ekoyTmhLemNBaXFxYzlzalVDeUp0M2VlOXpoajJsMTZHNXU5NXJvQw==";

const getCountries = async (): Promise<Country[]> => {
  const response = await axios.get<Promise<Country[]>>(url, {
    headers: {
      "X-CSCAPI-KEY": apiKey,
    },
    withCredentials: false,
  });
  return response.data;
};

const getStates = async (idCountry: string): Promise<State[]> => {
  const response = await axios.get<Promise<State[]>>(
    `${url}/${idCountry}/states`,
    {
      headers: {
        "X-CSCAPI-KEY": apiKey,
      },
      withCredentials: false,
    }
  );
  return response.data;
};

const getCities = async ({
  idCountry,
  idState,
}: {
  idCountry: string;
  idState: string;
}): Promise<State[]> => {
  const response = await axios.get<Promise<State[]>>(
    `${url}/${idCountry}/states/${idState}/cities`,
    {
      headers: {
        "X-CSCAPI-KEY": apiKey,
      },
      withCredentials: false,
    }
  );
  return response.data;
};

export { getCountries, getStates, getCities };
