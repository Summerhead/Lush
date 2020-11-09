$.ajax({
  type: "POST",
  url: document.location.pathname,
  success: function (resp) {
    const response = resp;
    const links = response.links;
    const scripts = response.scripts;

    if (links) {
      const head = document.getElementsByTagName("head")[0];

      links.forEach((link) => {
        const linkEl = document.createElement("link");
        linkEl.setAttribute("rel", "stylesheet");
        linkEl.setAttribute("type", "text/css");
        linkEl.setAttribute("href", link);
        head.appendChild(linkEl);
      });
    }

    if (scripts) {
      const body = document.getElementsByTagName("body")[0];

      scripts.forEach((script) => {
        const scriptEl = document.createElement("script");
        scriptEl.setAttribute("type", script.type);
        scriptEl.setAttribute("src", script.link);
        body.appendChild(scriptEl);
      });
    }
  },
});
