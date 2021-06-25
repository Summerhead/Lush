import HeroPage from "./Hero.js";
import loadHeroCentralBlock from "./loadHeroCentralBlock.js";
import { header } from "../header/loadHeader.js";

export const loadMain = async () => {
  header.setDefaultStyle();

  await Promise.resolve(loadHeroCentralBlock()).then((template) => {
    new HeroPage(template);
  });
};
