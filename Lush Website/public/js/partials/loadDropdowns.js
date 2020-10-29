$.ajax({
  type: "GET",
  url: "/header",
  dataType: "json",
  success: function (data) {
    console.log("Data:", data);

    displayHeaderInfo(data.results);
  },
  error: function (x, t, m) {
    console.log("Error:", m);
  },
});

function displayHeaderInfo(results) {
  for (const tab of document.querySelectorAll("#nav-bar>li")) {
    const dropdown = document.createElement("div");
    dropdown.setAttribute("class", "dropdown");
    dropdown.addEventListener("scroll", () => {});

    tab.append(dropdown);

    displayArtistsInHeader(results.artists);
  }
}

function displayArtistsInHeader(artists) {
  var i = 0;
  artists.forEach((el) => {
    $("#artists-tab").find(".dropdown").append(`<p>${el.artist}</p>`);
    i++;
  });
}
