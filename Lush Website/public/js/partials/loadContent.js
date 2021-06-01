import { loadMain } from ".././loadMain.js";
import { loadAudios } from "../audios/loadAudios.js";
import { loadArtists } from "../artists/loadArtists.js";
import { loadArtist } from "../artist/loadArtist.js";
import { loadAudioSearchBar } from "../searchBar/audios/loadAudioSearchBar.js";
import { loadArtistSearchBar } from "../searchBar/artists/loadArtistSearchBar.js";
// import { loadGenres } from "../genres/loadGenres.js";
import { loadPlaylistSearchBar } from "../searchBar/playlists/loadPlaylistSearchBar.js";
import { loadPlaylists } from "../playlists/loadPlaylists.js";
import LushURL from "./LushURL.js";
import { currentAudio } from "../audios/Audio.js";

var lushURL;

export default async function showPage(href, skipPushState) {
  await Promise.resolve(getPages(href))
    // The order is important
    .then(({ pagepath, title, scripts }) => loadPage(pagepath, title, scripts))
    .then(({ main, title, scripts }) => {
      displayMain(main, scripts);
      return [title, scripts];
    })
    .then(([title, scripts]) => {
      setTitle(title);
      return scripts;
    })
    .then((scripts) => {
      if (scripts) runScripts(scripts, href, skipPushState);
    });
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

function loadPage(pagepath, title, scripts) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", pagepath);
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const page = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );

        resolve({
          main: page.getElementById("main"),
          title: title,
          scripts: scripts,
        });
      }
    };
    xhr.send();
  });
}

function displayMain(main, scripts) {
  if (currentAudio) {
    main.classList.add("compensate-header");
  }
  document.getElementById("main").replaceWith(main);

  return scripts;
}

function runScripts(scripts, href, skipPushState) {
  if (!skipPushState) {
    history.pushState({ href: href }, "", href);
  }

  lushURL = new LushURL(location.search);

  scripts.forEach((script) => eval(script)());
}

function setTitle({ isDefaultTitle, name }) {
  if (
    isDefaultTitle &&
    (!currentAudio ||
      (currentAudio && !currentAudio.classList.contains("current")))
  ) {
    document.title = name;
  }
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
