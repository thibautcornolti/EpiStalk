$('.message a').click(function () {
    $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$("#login").on("click", login);
$("#register").on("click", register);
$('#close').on('click', hideAlert);

$("#close").fadeOut();

function showAlert(msg) {
    $("#alert-msg").text(msg);
    $(".alert").removeClass('out');
    $(".alert").addClass('in');
    $("#close").fadeIn();
}

function hideAlert() {
    $(".alert").removeClass('in');
    $(".alert").addClass('out');
    $("#close").fadeOut();
}

function login() {
    let email = $("#lemail").val();
    let pass = $("#lpass").val();
    console.log(email)
    $.post("/login", { email, pass }, function (data) {
        hideAlert();
        $(location).attr('href', '/home');
    }).fail(function (data, textStatus, xhr) {
        let res = JSON.parse(data.responseText);
        showAlert(res.error);
    });
}

function register() {
    let email = $("#remail").val();
    let pass = $("#rpass").val();
    $.post("/register", { email, pass }, function (data) {
        hideAlert();
        $(location).attr('href', '/home');
    }).fail(function (data, textStatus, xhr) {
        let res = JSON.parse(data.responseText);
        showAlert(res.error);
    });
}
