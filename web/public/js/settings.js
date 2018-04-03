var user;

$(document).ready(function () {
    $.get("/api/user", function (data) {
        user = data.user;
        refreshCheckbox();
        setUserFields();
    });

    $("#change").on("click", changePassword);
    $('#close').on('click', hideAlert);
    $("#close").fadeOut();
    let ns = ["gpa", "credit", "log", "mark", "rank"];
    for (let i = 0; i < ns.length; ++i)
        $("#checkbox-" + ns[i] + "-settings").change(clickCheckbox);
});

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
    $(".alert").removeClass('alert-danger');
    $(".alert").addClass('out');
    $("#close").fadeOut();
}

/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    if (user) {
        let name = user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    } else
        $(".get-upper-user").text("NaN");
}

function clickCheckbox() {
    let me = $(this);
    let n = me.attr("id").split("-")[1];
    toggleSpinner(0, n);
    d = {
        name: "show_" + n,
        value: me.is(":checked"),
    };
    $.post("/api/preference", d, function () {
        refreshCheckbox(n);
    }).fail(function (data) {
        me.prop("checked", !me.is(":checked"));
        $("#small-" + n + "-settings").text(data.responseJSON.error);
        toggleSpinner(2, n);
    });
}

function refreshCheckbox(n) {
    toggleSpinner(0, n);
    $.get("/api/user", function (data) {
        user = data.user;
        $("#checkbox-gpa-settings").prop("checked", (user.gpa != undefined));
        $("#checkbox-credit-settings").prop("checked", (user.credit != undefined));
        $("#checkbox-log-settings").prop("checked", (user.current_week_log != undefined));
        $("#checkbox-mark-settings").prop("checked", (user.show_mark == true));
        $("#checkbox-rank-settings").prop("checked", (user.show_rank == true));
        toggleSpinner(1, n);
    }).fail(function () {
        toggleSpinner(2, n);
    });
}

function toggleSpinner(state, n) {
    let ns = ["gpa", "credit", "log", "mark", "rank"];
    if (n)
        ns = [n];
    for (let i = 0; i < ns.length; ++i) {
        $("#spinner-" + ns[i] + "-settings").removeClass("glyphicon glyphicon-ok glyphicon-remove glyphicon-refresh glyphicon-refresh-animate");
        switch (state) {
            case 0: // spinning
                $("#spinner-" + ns[i] + "-settings").addClass("glyphicon glyphicon-refresh glyphicon-refresh-animate");
                break;
            case 1: // ok
                $("#spinner-" + ns[i] + "-settings").addClass("glyphicon glyphicon-ok");
                break;
            case 2: // failed
                $("#spinner-" + ns[i] + "-settings").addClass("glyphicon glyphicon-remove");
        }
    }
}

function changePassword() {
    let password = $("#password").val();
    let passwordConfirm = $("#passwordConfirm").val();
    if (password == undefined || password == "" ||
        passwordConfirm == undefined || passwordConfirm == "")
        showAlert("Empty field", "alert-warning");
    else if (password != passwordConfirm) {
        showAlert("Password fields do not match", "alert-danger");
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