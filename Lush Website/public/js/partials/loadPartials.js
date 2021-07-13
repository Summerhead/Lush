import { loadHeader } from "../header/loadHeader.js";
// import loadFooter from "./loadFooter.js";
import showPage from "./loadContent.js";
import { configureEditWindows } from "./configureEditWindows.js";

document.body.onload = () => {
  window.onpopstate = function (event) {
    if (event.state) {
      // console.log(e.state);
      showPage(event.state.href, true);
    }
  };

  loadHeader();
  // loadFooter();

  showPage(location.href);
};
