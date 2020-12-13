(() => {
  const xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        ),
        searchBar = template.getElementsByClassName("search-bar-container")[0];

      document.getElementsByTagName("main")[0].prepend(searchBar);
    }
  };

  xmlhttp.open("GET", "/public/html/partials/searchBar.html", true);
  xmlhttp.send();
})();
