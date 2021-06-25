import showPage from "../partials/loadContent.js";
import { editArtistWindow } from "./loadArtists.js";

export default class Artist {
  constructor(artistLi, artist) {
    this.artistLi = artistLi.cloneNode(true);
    this.artist = artist;

    this.artistLink = this.artistLi.querySelector(".artist-link");
    this.imageWrapper = this.artistLi.querySelector(".image-wrapper");
    this.artistName = this.artistLi.querySelector(".artist-name");
    this.buttonEdit = this.artistLi.querySelector(".button-edit");
    this.buttonDelete = this.artistLi.querySelector(".button-delete");

    this.configure();
  }

  configure() {
    this.artistName.innerText = this.artist.artist_name;

    this.artistLink.href += `${this.artist.artist_id}/${this.artist.artist_name
      .replace(/ /g, "+")
      .replace(/\//g, "%2F")}`;

    if (this.artist.image_id) {
      this.imageWrapper.style.backgroundImage = `url("https://drive.google.com/uc?export=view&id=${this.artist.image_id}")`;
      this.imageWrapper.classList.remove("no-cover");
    }

    // this.artistName.href += `${
    //   this.artist.artist_id
    // }/${this.artist.artist_name.replace(/ /g, "+").replace(/\//g, "%2F")}`;
    // artistLi.querySelector("#artist-description").innerText =
    //   artist.artist_id;

    // this.artistLi.setAttribute("data-artist-id", this.artist.artist_id);
    // this.artistLi.setAttribute("data-artist-name", this.artist.artist_name);

    this.setActions();
  }

  setActions() {
    this.artistLink.onclick = (event) => {
      showPage(event.target.href);
      return false;
    };

    // this.artistName.onclick = (event) => {
    //   showPage(event.target.href);
    //   return false;
    // };

    this.buttonEdit.addEventListener("click", this.editAction);
    this.buttonDelete.addEventListener("click", this.deleteAction);

    // artistLi
    //   .querySelector("#set-tag")
    //   .addEventListener("click", this.setTag);

    this.imageWrapper.addEventListener("mouseover", this.setHoveredClass);
    this.imageWrapper.addEventListener("mouseout", this.removeHoveredClass);
    // this.artistName.addEventListener("mouseover", this.setHoveredClass);
    // this.artistName.addEventListener("mouseout", this.removeHoveredClass);
  }

  setHoveredClass = () => {
    this.artistLi.classList.add("hovered");
  };

  removeHoveredClass = () => {
    this.artistLi.classList.remove("hovered");
  };

  showPageFromHref(link) {
    showPage(link.href);
    return false;
  }

  editAction = () => {
    editArtistWindow.open(
      this.artist,
      this.artistLi.querySelector(".image-wrapper")
    );
  };

  deleteAction = () => {
    const xhr = new XMLHttpRequest();

    xhr.open("DELETE", "/deleteArtist", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);
      }
    };

    const dataJSON = {
      artistId: this.artist.artist_id,
    };

    xhr.send(JSON.stringify(dataJSON));
  };
}
