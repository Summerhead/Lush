// $("#nav-bar>li").each(function () {
//     $(this)
//         .append('<div class="dropdown"></div>')
//         .find(".dropdown")
//         .load("/public/html/partials/dropdowns.html");
// });

$.ajax({
    type: "GET",
    url: "/header",
    dataType: "json",
    success: function (data) {
        console.log("Data:", data);

        displayHeaderInfo(data["results"]);
    },
    error: function (x, t, m) {
        console.log("Error:", m);
    },
});

function displayHeaderInfo(results) {
    displayArtistsInHeader(results["artists"]);
}

function displayArtistsInHeader(artists) {
    $("#artists-tab").append('<div class="dropdown"></div>');
    var i = 0;
    artists.forEach((el) => {
        $("#artists-tab").find(".dropdown").append(`<p>${el["artist"]}</p>`);
        i++;
    });
}
