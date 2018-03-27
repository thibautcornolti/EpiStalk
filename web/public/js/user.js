
let user;

$.urlParam = function (name) {
    let results = new RegExp('[\?&]' + name + '=([^&#]*)')
        .exec(window.location.href);
    return (results) ? results[1] : "";
}

$(document).ready(function () {
    $.get("/api/user?login=" + $.urlParam("login"), function (data) {
        user = data.user;
        main();
    });
});

function main() {
    setUserFields();
    setLoginFields();
    setUserPictures();
}

/* Replace all pictures with the "user-picture" attribute with the user's picture. */
function setUserPictures() {
    let url = "https://cdn.local.epitech.eu/userprofil/profilview/";
    if (user) {
        let name = user.email.split("@")[0];
        $(".user-picture").attr("src", url+name+".png");
    }
}

/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    if (user) {
        let name = user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    } else
        $(".get-upper-user").text("NaN");
}

/* Replace all fields with the "get-login" attribute with the login name. */
function setLoginFields() {
    if (user)
        $(".get-login").text(user.email);
    else
        $(".get-login").text("NaN");
}
