import showPage from "../partials/loadContent.js";

export const headerS = () => {
  $.ajax({
    type: "GET",
    url: "/header",
    dataType: "json",
    success: function (data) {
      console.log("Data:", data);

      displayHeaderInfo(data.results);
    },
    error: function (error) {
      console.log("Error:", error);
    },
  });

  function displayHeaderInfo(results) {
    for (const tab of document.querySelectorAll("#nav-bar>li")) {
      const dropdown = document.createElement("div");
      dropdown.setAttribute("class", "dropdown");

      tab.append(dropdown);

      displayArtistsInHeader(results.artists);
    }
  }

  function displayArtistsInHeader(artists) {
    artists.forEach((el) => {
      $("#artists-tab").find(".dropdown").append(`<p>${el.artist}</p>`);
    });
  }

  [...document.getElementsByTagName("a")].forEach((link) => {
    link.onclick = () => {
      showPage(link);
      return false;
    };
  });
};
