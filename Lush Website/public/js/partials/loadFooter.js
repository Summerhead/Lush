export default function loadFooter() {
  const xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        ),
        footer = template.getElementById("footer-wrapper");

      footer.querySelector(
        "#copyright #curr-date"
      ).innerText = new Date().getFullYear();

      document.getElementsByTagName("footer")[0].prepend(footer);
    }
  };

  xmlhttp.open("GET", "/public/html/partials/footer.html", true);
  xmlhttp.send();
}
