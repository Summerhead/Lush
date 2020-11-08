export default function loadAudioTemplate() {
  const xmlhttp = new XMLHttpRequest();
  var template, audioLi;

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        );
        audioLi = template.getElementsByClassName("audio-list-item")[0];

        resolve(audioLi);
      }
    };

    xmlhttp.open(
      "GET",
      `/public/html/partials/audios/audioTemplate.html`,
      true
    );
    xmlhttp.send();
  });
}
