var audioLi;

export default function loadAudioTemplate() {
  const xmlhttp = new XMLHttpRequest();
  var template;

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        audioLi = template.getElementsByClassName("audio-container")[0];

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

export { audioLi };
