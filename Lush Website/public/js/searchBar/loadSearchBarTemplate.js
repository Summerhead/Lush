export default function loadSearchBarTemplate() {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          searchBar = template.getElementById("search-bar-container");

        resolve(searchBar);
      }
    };

    xmlhttp.open("GET", "/public/html/partials/searchBar.html", true);
    xmlhttp.send();
  });
}
