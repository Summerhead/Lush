import getSearchBar from "./searchBarScript.js";
import loadSearchBarTemplate from "./loadSearchBarTemplate.js";

export const loadSearchBar = async () => {
  await Promise.resolve(loadSearchBarTemplate()).then((searchBar) =>
    getSearchBar(searchBar)
  );
};
