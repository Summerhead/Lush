export default function loadHeroCentralBlock() {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        const heroCentralBlock = template.getElementById("hero-central-block");

        resolve(heroCentralBlock);
      }
    };

    xmlhttp.open("GET", "/public/html/partials/hero.html", true);
    xmlhttp.send();
  });
}
