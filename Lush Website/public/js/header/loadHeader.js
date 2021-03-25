import Header from "./Header.js";
import loadHeaderTemplate from "./loadHeaderTemplate.js";

var header;

export const loadHeader = async () => {
  await Promise.resolve(loadHeaderTemplate()).then(
    (headerTemplate) => (header = new Header(headerTemplate))
  );
};

export { header };
