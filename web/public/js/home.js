
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
    buildLeaderboard();
    
    $.get("/api/autologin", function (data) {
        if (data.autologin == 0)
            $("#modalSetting").modal('show');
    }).fail(function (data, textStatus, xhr) {
        $(location).attr('href', '/login');
    });
    $("#close").fadeOut();
    $('#close').on('click', hideAlert);
    $("#save-click").on("click", save);
    $("#leaderboard tr").on("click", function () {
        if ($(this).hasClass("user-leaderboard"))
            $(location).attr("href", "/user?login="+$(this).attr("login"))
    });
}


function save() {
    let autologin = $("#autologin").val();
    let gpa = $('#check-gpa').is(":checked") ? '1' : '0'
    let credit = $('#check-credits').is(":checked") ? '1' : '0'
    let log = $('#check-log').is(":checked") ? '1' : '0'
    let marks = $('#check-marks').is(":checked") ? '1' : '0'
    let moduleGrade = $('#check-module').is(":checked") ? '1' : '0'
    
    if (autologin == "" || autologin == undefined) {
        hideAlert();
        showAlert('Empty Field!', "alert-warning")
    }
    $.post("/api/settings", {autologin, gpa, credit, log, marks, moduleGrade}, function (data) {
        hideAlert();
        showAlert('You saved your personnal settings with success !', "alert-success")
        $('#modalSetting').modal('hide');
    }).fail(function (data, textStatus, xhr) {
        hideAlert();
        showAlert('Request failed! Please re-try.', "alert-danger")
    });
}

/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    if (user) {
        let name = user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    } else
        $(".get-upper-user").text("NaN");
}

/* Build the responsive table from /api/users where we get all the users. */
function buildLeaderboard() {
    $(".spinner-leaderboard").remove();
    function buildCell(i, key, endMsg, plurial) {
        be = (plurial) ? "are" : "is";
        your = (plurial) ? "yours" : "your";
        if (!user[key])
            return '<td><div data-toggle="tooltip" data-placement="top" title="The ' + endMsg + ' ' + be + ' hidden until you share ' + your + '"><a href="/settings">?</a></div></td>';
        else if (!users[i][key])
            return '<td><div data-toggle="tooltip" data-placement="top" title="This user has hidden his ' + endMsg + '">?</div></td>';
        else
            return '<td>' + users[i][key] + '</td>';
    }
    users.sort(function (a, b) {
        if (!a.gpa)
            return true;
        else if (!b.gpa)
            return false;
        return a.gpa < b.gpa;
    });
    for (let i = 0; i < users.length; i++) {
        let credit = buildCell(i, "credit", "credits", true);
        let gpa = buildCell(i, "gpa", "GPA", false);
        let log = buildCell(i, "current_week_log", "log time", false);
        let lastName = users[i].email.toUpperCase().split('@')[0].split('.')[1];
        let firstName = users[i].email.split('.')[0].toUpperCase();
        let tab = '<tr login="'+users[i].email+'" class="center user-leaderboard">' +
            '<th class="center" scope="row">' + (i + 1) + '</th>' +
            '<td>' + firstName + '</td>' +
            '<td>' + lastName + '</td>' +
            '<td>' + users[i].city + '</td>' +
            '<td>' + users[i].promo + '</td>' +
            log + credit + gpa +
            '</tr>'
        $("#leaderboard").find('tbody').append(tab);
    }
    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}

function sortLeaderboard(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("leaderboard");
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n].innerHTML.toLowerCase();
            y = rows[i + 1].getElementsByTagName("TD")[n].innerHTML.toLowerCase();
            if (x.indexOf("?") > -1)
                x = (dir == "asc") ? "\255" : "\000";
            if (y.indexOf("?") > -1)
                y = (dir == "desc") ? "\000" : "\255";
            if (dir == "asc") {
                if (x > y) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x < y) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}


$(document).ready(function () {
    $("#search-leaderboard").on("keyup", function () {
        var values = $(this).val().toLowerCase().split(' ');
        $("#leaderboard tr").filter(function () {
            if (!$(this).hasClass("header-leaderboard")) {
                let show = true;
                for (let i = 0; i < values.length; ++i)
                    show = ($(this).text().toLowerCase().indexOf(values[i]) < 0) ? false : show;
                $(this).toggle(show);
            }
        });
    });
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
    $(".alert").addClass('out');
    $("#close").fadeOut();
}