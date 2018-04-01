let user;
let users;

$.get("/api/user", function (data) {
    user = data.user;
    $.get("/api/users", function (data) {
        users = data.users;
        main();
    })
})

$('#close').on('click', hideAlert);

$("#close").fadeOut();

function showAlert(msg, level) {
    $("#alert-msg").text(msg);
    $(".alert").addClass(level)
    $(".alert").removeClass('out');
    $(".alert").addClass('in');
    $("#close").fadeIn();
}

function hideAlert() {
    $(".alert").removeClass('in');
    $(".alert").removeClass('alert-success');
    $(".alert").removeClass('alert-warning');
    $(".alert").addClass('out');
    $("#close").fadeOut();
}

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
    if (password == undefined || password == "" ||
        passwordConfirm == undefined || passwordConfirm == "")
        showAlert("Field empty", "alert-warning");
    else if (password != passwordConfirm) {
        showAlert("Password are not the same", "alert-danger");
    }
    else
        $.post("/api/password", { passwordConfirm }, function (data) {
            hideAlert();
            showAlert("Your password has been changed!", "alert-success")
        }).fail(function (data, textStatus, xhr) {
            let res = JSON.parse(data.responseText);
            if (res.error)
                showAlert(res.error, "alert-danger")
        });
}