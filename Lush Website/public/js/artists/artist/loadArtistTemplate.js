export default function loadArtistTemplate() {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          artistLi = template.getElementsByClassName("artist-container")[0];

        resolve(artistLi);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/artists/artist/artistTemplate.html",
      true
    );
    xmlhttp.send();
  });
}
