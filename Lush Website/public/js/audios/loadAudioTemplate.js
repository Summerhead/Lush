export default function loadAudioTemplate() {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        const audioLi = template.getElementsByClassName("audio-li")[0];

        resolve(audioLi);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/audios/audioTemplate.html",
      true
    );

    xmlhttp.send();
  });
}
