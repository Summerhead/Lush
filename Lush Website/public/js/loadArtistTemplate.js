const xmlhttp = new XMLHttpRequest();
var template, artistDiv;

export default function loadArtistTemplate() {
  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        artistDiv = template.getElementsByClassName("artist-container")[0];

        resolve(artistDiv);
      }
    };

    xmlhttp.open("GET", `/public/html/partials/artistTemplate.html`, true);
    xmlhttp.send();
  });
}

export { artistDiv };
