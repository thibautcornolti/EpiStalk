$('.message a').click(function () {
    toggleForm();
});

$("#login").on("click", login);
$("#register").on("click", register);
$('#close').on('click', hideAlert);

$("#close").fadeOut();

function toggleForm() {
    $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
}

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

function login() {
    let email = $("#lemail").val();
    let pass = $("#lpass").val();
    $.post("/api/login", { email, pass }, function (data) {
        hideAlert();
        showAlert("You have been logged", "alert-success")
        document.cookie = "token=" + data.token;
        $(location).attr('href', '/home');
    }).fail(function (data, textStatus, xhr) {
        hideAlert();
        let res = JSON.parse(data.responseText);
        if (res.error)
            showAlert(res.error, "alert-danger");
        else if (res.warning)
            showAlert(res.warning, "alert-warning")
    });
}

function register() {
    let email = $("#remail").val();
    let pass = $("#rpass").val();
    $.post("/api/register", { email, pass }, function (data) {
        hideAlert();
        showAlert(data.message, "alert-success");
        toggleForm();
    }).fail(function (data, textStatus, xhr) {
        hideAlert();
        let res = JSON.parse(data.responseText);
        if (res.error)
            showAlert(res.error, "alert-danger");
        else if (res.warning)
            showAlert(res.warning, "alert-warning")
    });
}
