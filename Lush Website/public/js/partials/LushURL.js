export default class LushURL extends URLSearchParams {
  constructor(search) {
    super(search);

    this.queryKey = "q";
    this.genresKey = "genres";
    this.shuffleKey = "shuffle";
    this.currentPage;

    this.setCurrentPage();
  }

  setQuery(value) {
    this.#insert(this.queryKey, value);
  }

  getQuery() {
    return this.get(this.queryKey);
  }

  setGenre(value) {
    this.#append(this.genresKey, value);
  }

  removeGenre(value) {
    this.#remove(this.genresKey, value);
  }

  getGenres() {
    return this.get(this.genresKey);
  }

  hasGenres() {
    return this.has(this.genresKey);
  }

  setShuffle() {
    this.#insert(this.shuffleKey, 1);
  }

  deleteShuffle() {
    this.#delete(this.shuffleKey);
  }

  getShuffle() {
    return this.get(this.shuffleKey);
  }

  #insert(key, value) {
    if (value === "") {
      super.delete(key);
    } else {
      super.set(key, value);
    }

    this.#pushState();
  }

  #append(key, value) {
    if (this.has(key)) {
      const values = this.get(key);
      if (!values.split("_").includes(value)) {
        value = values + "_" + value;
      } else {
        value = values;
      }
    }

    this.set(key, value);
    this.#pushState();
  }

  #delete(key) {
    super.delete(key);
    this.#pushState();
  }

  #remove(key, value) {
    if (this.has(key)) {
      const values = this.get(key);
      const valuesArray = values.split("_");
      const index = valuesArray.indexOf(value);
      if (index > -1) {
        valuesArray.splice(index, 1);
        value = valuesArray.join("_");
      } else {
        value = values;
      }
    }

    if (value === "") {
      super.delete(key);
    } else {
      super.set(key, value);
    }

    this.#pushState();
  }

  #pushState() {
    var search = this.toString();
    if (search) {
      search = "?" + search;
    }
    const href = location.pathname + search;
    history.pushState({ href: href }, "", href);
  }

  setCurrentPage() {
    const pathnameArray = location.pathname.split("/");
    var [_, firstFolder, secondFolder] = pathnameArray;
    if (Number.isInteger(Number(secondFolder))) {
      firstFolder = firstFolder.slice(0, -1);
    }
    this.currentPage = firstFolder;
  }

  getCurrentPage() {
    return this.currentPage;
  }

  processArtistId() {
    if (this.currentPage === "artist") {
      return location.pathname.split("/")[2];
    }
    return null;
  }

  processPlaylistId() {
    if (this.currentPage === "playlist") {
      return location.pathname.split("/")[2];
    }
    return null;
  }

  processSearchQuery() {
    return this.getQuery()?.replace('"', '\\"');
  }

  processGenresQuery() {
    const genres = this.getGenres();
    if (genres) {
      return genres.split("_");
    }
    return null;
  }

  processShuffleQuery() {
    if (this.getShuffle() == 1) {
      return true;
    }
    return false;
  }
}
