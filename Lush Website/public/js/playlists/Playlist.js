import showPage from "../partials/loadContent.js";
import { editPlaylistWindow } from "./loadPlaylists.js";

export default class Playlist {
  constructor(playlistLi, playlist) {
    this.playlistLi = playlistLi.cloneNode(true);
    this.playlist = playlist;

    this.playlistLink = this.playlistLi.querySelector("#playlist-link");
    this.imageWrapper = this.playlistLi.querySelector(".image-wrapper");
    this.playlistName = this.playlistLi.querySelector("#playlist-name");
    this.buttonEdit = this.playlistLi.querySelector("#button-edit");
    this.buttonDelete = this.playlistLi.querySelector("#button-delete");

    this.setValues();
    this.setActions();
  }

  setValues() {
    this.playlistName.innerText = this.playlist.name;
    this.playlistLink.href += `${
      this.playlist.playlist_id
    }/${this.playlist.name.replace(/ /g, "+").replace(/\//g, "%2F")}`;
    this.playlistName.href += `${
      this.playlist.playlist_id
    }/${this.playlist.name.replace(/ /g, "+").replace(/\//g, "%2F")}`;
    // artistLi.querySelector("#artist-description").innerText =
    //   artist.artist_id;

    this.playlistLi.setAttribute("data-playlist-id", this.playlist.playlist_id);
    this.playlistLi.setAttribute("data-playlist-name", this.playlist.name);
  }

  setActions() {
    this.playlistLink.onclick = (event) => {
      showPage(event.target.href);
      return false;
    };
    this.playlistName.onclick = (event) => {
      showPage(event.target.href);
      return false;
    };

    this.buttonEdit.addEventListener("click", this.editAction);
    this.buttonDelete.addEventListener("click", this.deleteAction);

    // artistLi
    //   .querySelector("#set-tag")
    //   .addEventListener("click", this.setTag);

    this.imageWrapper.addEventListener("mouseover", this.setHoveredClass);
    this.imageWrapper.addEventListener("mouseout", this.removeHoveredClass);
    // this.playlistName.addEventListener("mouseover", this.setHoveredClass);
    // this.playlistName.addEventListener("mouseout", this.removeHoveredClass);
  }

  setHoveredClass = () => {
    this.playlistLi.classList.add("hovered");
  };

  removeHoveredClass = () => {
    this.playlistLi.classList.remove("hovered");
  };

  showPageFromHref(link) {
    showPage(link.href);
    return false;
  }

  editAction(event) {
    editPlaylistWindow.open(event.target.closest(".playlist-li"));
  }

  deleteAction(event) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/deletePlaylist", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);
      }
    };

    const dataJSON = {
      playlistId: event.target
        .closest(".playlist-li")
        .getAttribute("data-playlist-id"),
    };

    xhr.send(JSON.stringify(dataJSON));
  }
}
