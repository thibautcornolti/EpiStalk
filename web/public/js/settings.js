
let user;
let users;

$.get("/api/user", function (data) {
    user = data.user;
    $.get("/api/users", function (data) {
        users = data.users;
        main();
    })
})

function main() {
    setUserFields();

    $("#change").on("click", changePassword);
}

/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    if (user) {
        let name = user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    } else
        $(".get-upper-user").text("NaN");
}

function changePassword() {
    let password = $("#password").val();
    let passwordConfirm = $("#passwordConfirm").val();    
    $.post("/api/password", { password, passwordConfirm }, function (data) {
        console.log("success");
    }).fail(function (data, textStatus, xhr) {
        let res = JSON.parse(data.responseText);
        if (res.error)
            console.log(res.error);
        else if (res.warning)
            console.log(res.warning);
    });
}