$(document).ready(function () {
    $("body").append("<div id='first-connection-modal'></div>");
    $("#first-connection-modal").load("public/html/firstconnectionmodal.html", function () {
        $.get("/api/autologin", function (data) {
            if (!data.autologin) {
                let now = new Date().getTime();
                let creation = new Date(data.creation).getTime();
                let totalTimeInMs = 48 * 60 * 60 * 1000;
                let remaining = parseInt((creation + totalTimeInMs - now) / (1000 * 60 * 60));
                $("#hour-left-autologin-preferences").text(remaining + "h");
                $("#modal-preferences").modal('show');
                window.open("https://intra.epitech.eu/admin/autolog", "popupWindow", "width=1000,height=500,scrollbars=yes");
                $('#close-preferences').on('click', clickClosePreferences);
                $("#save-preferences").on("click", clickSavePreferences);
                $("#close-alert-preferences").on("click", hidePreferencesAlert);
                $("#input-autologin-preferences").on("keyup", checkAutologin);
            }
        });
    });
});

function clickClosePreferences() {
    $('#modal-preferences').modal('hide');
}

function clickSavePreferences() {
    if ($(this).hasClass("disabled"))
        return;
    let autologin = $("#input-autologin-preferences").val();
    let show_gpa = $('#checkbox-gpa-preferences').is(":checked");
    let show_credit = $('#checkbox-credits-preferences').is(":checked");
    let show_log = $('#checkbox-log-preferences').is(":checked");
    let show_mark = $('#checkbox-marks-preferences').is(":checked");
    let show_rank = $('#checkbox-module-preferences').is(":checked");

    showAutologinSign("refresh", true);
    $.post("/api/preferences", { autologin, show_gpa, show_credit, show_log, show_mark, show_rank }, function (data) {
        showPreferencesAlert(data.message, "alert-success");
        $('#modal-preferences').modal('hide');
        document.location.reload();
    }).fail(function (data, textStatus, xhr) {
        showAutologinSign("remove", false, true);
        showPreferencesAlert(data.responseJSON.error, "alert-danger");
    });
}

function checkAutologin() {
    let reg = $(this).val().match(/https:\/\/intra.epitech.eu\/auth-/i)
    $("#save-preferences").removeClass("disabled");
    $("#tip-autologin-preferences").removeClass("in");
    $("#tip-autologin-preferences").removeClass("out");
    if (!$(this).val().length) {
        showAutologinSign("");
        $("#save-preferences").addClass("disabled");
        $("#tip-autologin-preferences").addClass("out");
    }
    else if (!reg || reg.index) {
        showAutologinSign("warning-sign", false, true);
        $("#save-preferences").addClass("disabled");
        $("#tip-autologin-preferences").addClass("in");
    } else {
        showAutologinSign("ok", false, true);
        $("#tip-autologin-preferences").addClass("out");
    }
}

function showAutologinSign(sign, spin, color) {
    $("#div-autologin-preferences").removeClass("has- has-success has-warning has-error");
    $("#feedback-autologin-preferences").removeClass("glyphicon-ok glyphicon-warning-sign glyphicon-remove glyphicon-refresh glyphicon-refresh-animate");
    $("#feedback-autologin-preferences").addClass("glyphicon-" + sign);
    if (color)
        $("#div-autologin-preferences").addClass("has-" + { "refresh": "", "ok": "success", "warning-sign": "warning", "remove": "error" }[sign]);
    if (spin)
        $("#feedback-autologin-preferences").addClass("glyphicon-refresh-animate");

}

function showPreferencesAlert(msg, level) {
    hidePreferencesAlert();
    $("#alert-msg").text(msg);
    $("#alert-preferences").addClass(level);
    $("#alert-preferences").removeClass('out');
    $("#alert-preferences").addClass('in');
    $("#close-alert-preferences").toggle(true);
}

function hidePreferencesAlert() {
    $("#alert-preferences").removeClass('in');
    $("#alert-preferences").removeClass('alert-success');
    $("#alert-preferences").removeClass('alert-warning');
    $("#alert-preferences").addClass('out');
    $("#close-alert-preferences").toggle(false);
}
