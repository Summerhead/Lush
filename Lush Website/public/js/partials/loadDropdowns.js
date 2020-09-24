$("#nav-bar>li").each(function () {
    $(this)
        .append('<div class="dropdown"></div>')
        .find(".dropdown")
        .load("/public/html/partials/dropdowns.html");
});
