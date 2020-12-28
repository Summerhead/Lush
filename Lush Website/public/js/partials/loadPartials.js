import loadHeader from "../header/loadHeader.js";
import loadFooter from "./loadFooter.js";
import showPage from "./loadContent.js";

loadHeader();
loadFooter();

showPage(location);

window.onpopstate = function (e) {
  if (e.state) {
    console.log(e.state.html);
    document.getElementById("main").innerHTML = e.state.html;
    document.title = e.state.pageTitle;
  }
};
