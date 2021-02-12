import { headerS } from "./loadDropdowns.js";
import showPage from "../partials/loadContent.js";

export default async function loadHeader() {
  await Promise.resolve(getHeader()).then((header) => {
    displayHeaderRelated(header);
    // applyFixedHeaderAction(header);
  });
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

function applyFixedHeaderAction(header) {
  var mousePos;

  document.onmousemove = handleMouseMove;
  setInterval(getMousePosition, 100); // setInterval repeats every X ms

  function handleMouseMove(event) {
    event = event || window.event; // IE-ism

    mousePos = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function getMousePosition() {
    const pos = mousePos;
    if (pos) {
      if (pos.y <= header.offsetHeight) {
        header.style.position = "fixed";
      } else {
        header.style.position = "relative";
      }
    }
  }
}

function displayHeaderRelated(header) {
  const body = document.getElementsByTagName("body")[0];
  body.replaceChild(header, document.getElementById("header"));

  [...document.getElementsByTagName("a")].forEach((link) => {
    link.onclick = () => {
      showPage(link.href);
      return false;
    };
  });

  // headerS();
}
