export default function loadEditPlaylistWindow() {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        const editPlaylistWindowContainer = template.getElementById(
          "edit-playlist-window-container"
        );

        resolve(editPlaylistWindowContainer);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/playlists/editPlaylistWindow.html",
      true
    );

    xmlhttp.send();
  });
}
