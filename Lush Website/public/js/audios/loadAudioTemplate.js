export default function loadAudioTemplate() {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          audioLi = template.getElementsByClassName("audio-li")[0];

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
