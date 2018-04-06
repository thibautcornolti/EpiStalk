$(document).ready(function () {
    $("body").prepend("<div id='main-navbar'></div>");
    $("#main-navbar").load("public/html/navbar.html", function () {
        if (window.location.pathname.indexOf("/home") == 0)
            $("#nav-home-button").addClass("active");
        $(document).ready(function () {
            setUserFields();
        });
    });
});
