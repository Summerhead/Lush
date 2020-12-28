import { headerS } from "./loadDropdowns.js";

export default async function loadHeader() {
  await Promise.resolve(getHeader()).then((header) =>
    displayHeaderRelated(header)
  );
}

function getHeader() {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          header = template.getElementById("header");

        resolve(header);
      }
    };

    xmlhttp.open("GET", "/public/html/partials/header.html");
    xmlhttp.send();
  });
}

function displayHeaderRelated(header) {
  const body = document.getElementsByTagName("body")[0];
  body.replaceChild(header, document.getElementById("header"));

  headerS();
}
