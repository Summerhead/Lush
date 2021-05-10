export default function loadArtistTemplate() {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        const artistLi = template.getElementsByClassName("artist-li")[0];

        resolve(artistLi);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/artists/artistTemplate.html",
      true
    );

    xmlhttp.send();
  });
}
