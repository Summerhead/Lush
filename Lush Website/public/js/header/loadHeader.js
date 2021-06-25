import Header from "./Header.js";
import loadHeaderTemplate from "./loadHeaderTemplate.js";

var header;

export const loadHeader = async () => {
  header = new Header();
};

export { header };
