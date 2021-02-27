import { loadMain } from ".././loadMain.js";
import { loadAudios } from "../audios/loadAudios.js";
import { loadArtists } from "../artists/loadArtists.js";
import { loadArtist } from "../artists/artist/loadArtist.js";
import { loadAudioSearchBar } from "../searchBar/audios/loadAudioSearchBar.js";
import { loadArtistSearchBar } from "../searchBar/artists/loadArtistSearchBar.js";
import { loadGenres } from "../genres/loadGenres.js";
import { loadPlaylistSearchBar } from "../searchBar/playlists/loadPlaylistSearchBar.js";
import { loadPlaylists } from "../playlists/loadPlaylists.js";
import LushURL from "./LushURL.js";

var lushURL = new LushURL(location.search);

export default async function showPage(href, skipPushState) {
  await Promise.resolve(getPages(href))
    .then(({ pagepath, scripts }) => loadPage(pagepath, scripts))
    .then(({ main, scripts }) => displayMain(main, scripts))
    .then((scripts) => scripts && runScripts(scripts, href, skipPushState));
}

function getPages(href) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", href);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        resolve(this.response);
      }
    };

    xhr.send();
  });
}

function loadPage(pagepath, scripts) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", pagepath);
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const page = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );

        resolve({ main: page.getElementById("main"), scripts: scripts });
      }
    };
    xhr.send();
  });
}

function displayMain(main, scripts) {
  document.getElementById("main").replaceWith(main);

  return scripts;
}

function runScripts(scripts, pathname, skipPushState) {
  scripts.forEach((script) => eval(script)());

  if (!skipPushState) {
    // console.log(history.state);
    // console.log(pathname);
    history.pushState({ pathname: pathname }, "", pathname);

    // console.log(history.state);
    // console.log(history);
  }

  lushURL = new LushURL(location.search);
}

// function executeFunctionByName(functionName, context) {
//   var namespaces = functionName.split(".");
//   var func = namespaces.pop();
//   for (var i = 0; i < namespaces.length; i++) {
//     console.log(context);
//     context = context[namespaces[i]];
//   }
//   console.log(context, func);
//   return context[func].apply(context);
// }

// export function pushState(href) {
//   history.pushState(
//     { html: document.getElementsByTagName("body")[0].innerHTML },
//     "",
//     href
//   );
//   // console.log(history);
// }

export { lushURL };
