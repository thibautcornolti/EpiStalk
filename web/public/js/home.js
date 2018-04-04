var user;
var users;

$(document).ready(function () {
    $.get("/api/user", function (data) {
        user = data.user;
        setUserFields();
        $.get("/api/users", function (data) {
            users = data.users;
            for (let i = 0; i < users.length; ++i) {
                users[i].lastname = users[i].email.toUpperCase().split('@')[0].split('.')[1];
                users[i].firstname = users[i].email.split('.')[0].toUpperCase();
            }
            $(".spinner-leaderboard").remove();
            buildSortedLeaderboardBy("gpa");
            $("#leaderboard-data tr").on("click", function () {
                if ($(this).hasClass("user-leaderboard"))
                    $(location).attr("href", "/user?login=" + $(this).attr("login"))
            });
        })
    })
});

/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    if (user) {
        let name = user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    } else
        $(".get-upper-user").text("NaN");
}

function clearLeaderboard() {
    $("#leaderboard-data > tbody").html("");
}

function appendRow(n, newUser) {
    function buildCell(key, endMsg, plurial) {
        be = (plurial) ? "are" : "is";
        your = (plurial) ? "yours" : "your";
        if (!user[key])
            return '<td><div data-toggle="tooltip" data-placement="top" title="The ' + endMsg + ' ' + be + ' hidden until you share ' + your + '"><a href="/settings">?</a></div></td>';
        else if (!newUser[key])
            return '<td><div data-toggle="tooltip" data-placement="top" title="This user has hidden his ' + endMsg + '">?</div></td>';
        else
            return '<td>' + newUser[key] + '</td>';
    }
    let credit = buildCell("credit", "credits", true);
    let gpa = buildCell("gpa", "GPA", false);
    let log = buildCell("current_week_log", "log time", false);
    let tab = '<tr data-html="true" title="<img src=\'https://cdn.local.epitech.eu/userprofil/profilview/' + newUser.email.split("@")[0] + '.png\'>" data-toggle="tooltip" login="' + newUser.email + '" class="center user-leaderboard">' +
        '<th class="center" scope="row">' + n + '</th>' +
        '<td>' + newUser.firstname + '</td>' +
        '<td>' + newUser.lastname + '</td>' +
        '<td>' + newUser.city + '</td>' +
        '<td>' + newUser.promo + '</td>' +
        log + credit + gpa +
        '</tr>'
    $("#leaderboard-data").find('tbody').append(tab);
    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}

var lastTerm;
var reverse;
function buildSortedLeaderboardBy(term) {
    if (reverse === undefined)
        reverse = false;
    if (lastTerm == term)
        reverse = !reverse;
    lastTerm = term;
    let refs = {
        "gpa": function (a, b) { return parseFloat(b.gpa) - parseFloat(a.gpa); },
        "credit": function (a, b) { return parseFloat(b.credit) - parseFloat(a.credit); },
        "current_week_log": function (a, b) { return parseFloat(b.current_week_log) - parseFloat(a.current_week_log); },
        "promo": function (a, b) { return parseFloat(b.promo) - parseFloat(a.promo); },
    };
    let filter = ((term in refs) ? refs[term] : function (a, b) { return (a[term] > b[term]) ? 1 : ((b[term] > a[term]) ? -1 : 0); });
    buildSortedLeaderboard(term, filter, reverse)
}

function buildSortedLeaderboard(term, filter, reverse) {
    clearLeaderboard();
    users.sort(filter);
    if (reverse) {
        let count = users.length;
        for (let i = users.length - 1; i >= 0; --i)
            if (users[i][term])
                appendRow(count--, users[i]);
    } else {
        let count = 1;
        for (let i = 0; i < users.length; ++i)
            if (users[i][term])
                appendRow(count++, users[i]);
    }
    for (let i = 0; i < users.length; ++i)
        if (!users[i][term])
            appendRow("?", users[i]);
    alignCellsSize();
}

function alignCellsSize() {
    $(document).ready(() => {
        let tdHeader = document.getElementById("leaderboard-header").rows[0].cells;
        let tdDatas = document.getElementById("leaderboard-data").rows;
        let tdData = tdDatas[0].cells;
        for (let i = 0; i < tdDatas.length; i++)
            if (tdDatas[i].style.display.indexOf("none") < 0) {
                tdData = tdDatas[i].cells;
                break;
            }
        for (let i = 0; i < tdData.length; i++)
            tdHeader[i].style.width = tdData[i].offsetWidth + 'px';
    });
}

$(document).ready(function () {
    $("#search-leaderboard").on("keyup", function () {
        var values = $(this).val().toLowerCase().split(' ');
        $("#leaderboard-data tr").filter(function () {
            if (!$(this).hasClass("header-leaderboard")) {
                let show = true;
                for (let i = 0; i < values.length; ++i)
                    show = ($(this).text().toLowerCase().indexOf(values[i]) < 0) ? false : show;
                $(this).toggle(show);
            }
            alignCellsSize();
        });
    });
});
