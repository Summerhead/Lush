export default function loadHeaderTemplate() {
  const xmlhttp = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        const headerTemplate = template.getElementById("header");

        resolve(headerTemplate);
      }
    };

    xmlhttp.open("GET", "/public/html/partials/header.html", true);
    xmlhttp.send();
  });
}
