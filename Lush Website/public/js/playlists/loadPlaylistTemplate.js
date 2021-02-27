export default function loadPlaylistTemplate() {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          playlistLi = template.getElementsByClassName("playlist-li")[0];

        resolve(playlistLi);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/playlists/playlistTemplate.html",
      true
    );
    xmlhttp.send();
  });
}
