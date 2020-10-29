(() => {
  const xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const template = new DOMParser().parseFromString(
          this.responseText,
          "text/html"
        ),
        editAudioWindow = template.getElementById("edit-audio-window");

      document.getElementsByTagName("main")[0].prepend(editAudioWindow);
    }
  };

  xmlhttp.open(
    "GET",
    "/public/html/partials/audios/editAudioWindow.html",
    true
  );
  xmlhttp.send();
})();
