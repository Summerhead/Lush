import EditAudioWindow from "./EditAudioWindow.js";

export default function loadEditAudioWindow() {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          editAudioWindowContainer = template.getElementById(
            "edit-audio-window-container"
          );

        resolve(editAudioWindowContainer);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/audios/editAudioWindow.html",
      true
    );
    xmlhttp.send();
  });
}
