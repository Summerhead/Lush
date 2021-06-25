export default function loadSearchBarTemplate() {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        const searchBar = template.getElementById(
          "playlist-search-bar-container"
        );

        resolve(searchBar);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/searchBar/playlistSearchBar.html",
      true
    );

    xmlhttp.send();
  });
}
