export default class LushURL extends URLSearchParams {
  constructor(search) {
    super(search);
  }

  insertURLParam(key, value) {
    this.set(key, value);

    const pathname = location.pathname + "?" + this.toString();
    history.pushState({ pathname: pathname }, "", pathname);
  }
}
