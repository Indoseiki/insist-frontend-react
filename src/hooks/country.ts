import { useQuery } from "@tanstack/react-query";
import { Country, State } from "../types/country";
import { getCities, getCountries, getStates } from "../api/country";

const useCountriesQuery = () => {
  return useQuery<Country[], Error>({
    queryKey: ["Countries"],
    queryFn: () => getCountries(),
  });
};

const useStatesQuery = (idCountry: string) => {
  return useQuery<State[], Error>({
    queryKey: ["States"],
    queryFn: () => getStates(idCountry),
    enabled: !!idCountry,
  });
};

const useCitiesQuery = (params: { idCountry: string; idState: string }) => {
  return useQuery<State[], Error>({
    queryKey: ["Cities"],
    queryFn: () => getCities(params),
    enabled: !!params.idCountry && !!params.idState,
  });
};

export { useCountriesQuery, useStatesQuery, useCitiesQuery };
