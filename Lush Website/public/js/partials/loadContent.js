$.ajax({
  type: "POST",
  url: document.location.pathname,
  success: function (text) {
    const response = text;

    const head = document.getElementsByTagName("head")[0];
    response.links.forEach((link) => {
      const linkEl = document.createElement("link");
      linkEl.setAttribute("rel", "stylesheet");
      linkEl.setAttribute("type", "text/css");
      linkEl.setAttribute("href", link);
      head.appendChild(linkEl);
    });

    const body = document.getElementsByTagName("body")[0];
    response.scripts.forEach((script) => {
      const scriptEl = document.createElement("script");
      scriptEl.setAttribute("type", script.type);
      scriptEl.setAttribute("src", script.link);
      body.appendChild(scriptEl);
    });
  },
});
