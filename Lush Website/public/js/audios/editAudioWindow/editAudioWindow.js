export default function configureEditAudioWindow(editAudioWindowContainer) {
  editAudioWindowContainer
    .querySelector("#close-button")
    .addEventListener("click", () => deleteInputs());

  window.onclick = function (event) {
    if (
      editAudioWindowContainer.style.display == "block" &&
      !editAudioWindowContainer
        .querySelector("#edit-audio-window")
        .contains(event.target) &&
      !event.target.matches("#edit-button")
    ) {
      deleteInputs();
    }
  };

  function deleteInputs() {
    editAudioWindowContainer.querySelectorAll(".inputs").forEach((input) => {
      input.innerHTML = "";
    });
    editAudioWindowContainer.style.display = "none";
  }
}

export function openEditAudioWindow(editAudioWindowContainer, audioLi) {
  audioLi
    .getAttribute("data-artist-attributes")
    .split(" ")
    .forEach((attribute) => {
      const inputText = document.createElement("input");
      inputText.setAttribute("type", "text");
      inputText.value = audioLi.getAttribute(attribute);
      editAudioWindowContainer
        .querySelector("#artists>.inputs")
        .appendChild(inputText);
    });

  const inputText = document.createElement("input");
  inputText.setAttribute("type", "text");
  inputText.value = audioLi.getAttribute("data-audio-title");
  editAudioWindowContainer
    .querySelector("#title>.inputs")
    .appendChild(inputText);

  editAudioWindowContainer.style.display = "block";
}
