export default class LushURL extends URLSearchParams {
  constructor(search) {
    super(search);
  }

  insert(key, value) {
    if (value === "") {
      super.delete(key);
    } else {
      this.set(key, value);
    }
    this.#pushState();
  }

  append(key, value) {
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

  delete(key) {
    super.delete(key);
    this.#pushState();
  }

  remove(key, value) {
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
      this.set(key, value);
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
}
