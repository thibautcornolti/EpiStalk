
/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    $.get("/api/user", function (data) {
        let name = data.user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    }).fail(function (data, textStatus, xhr) {
        $(".get-upper-user").text("NaN");
    });
}

setUserFields();
