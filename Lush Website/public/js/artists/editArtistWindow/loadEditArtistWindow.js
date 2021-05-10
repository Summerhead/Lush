export default function loadEditArtistWindow() {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        const editArtistWindowContainer = template.getElementById(
          "edit-artist-window-container"
        );

        resolve(editArtistWindowContainer);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/artists/editArtistWindow.html",
      true
    );

    xmlhttp.send();
  });
}
