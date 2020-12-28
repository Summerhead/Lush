import { loadAudios } from "../audios/loadAudios.js";
import { loadArtists } from "../artists/loadArtists.js";
import { loadArtist } from "../artists/artist/loadArtist.js";
import { loadSearchBar } from "../searchBar/loadSearchBar.js";

const state = {};
var url = "";

export default async function showPage(link) {
  url = link.href;

  await Promise.resolve(getPages(link.pathname))
    .then(({ pagepath, scripts }) => loadPage(link, pagepath, scripts))
    .then(({ main, scripts }) => displayMain(main, scripts))
    .then((scripts) => (scripts ? runScripts(scripts) : 0));
}

function getPages(pathname) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", pathname);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const pageJSON = this.response;

        resolve(pageJSON);
      }
    };
    xhr.send();
  });
}

function loadPage(link, pagepath, scripts) {
  console.log(pagepath);
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", pagepath);
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const page = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );

        history.pushState(
          { html: document.getElementById("main").innerHTML },
          "",
          link.href
        );

        resolve({ main: page.getElementById("main"), scripts: scripts });
      }
    };
    xhr.send();
  });
}

function displayMain(main, scripts) {
  document
    .getElementsByTagName("body")[0]
    .replaceChild(main, document.getElementById("main"));
  return scripts;
}

function runScripts(scripts) {
  scripts.forEach((script) => eval(script)());
}

function executeFunctionByName(functionName, context) {
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for (var i = 0; i < namespaces.length; i++) {
    console.log(context);
    context = context[namespaces[i]];
  }
  console.log(context, func);
  return context[func].apply(context);
}
