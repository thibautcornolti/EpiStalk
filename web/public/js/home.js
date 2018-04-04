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
            $("#leaderboard tr").on("click", function () {
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
    $("#leaderboard > tbody").html("");
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
    $("#leaderboard").find('tbody').append(tab);
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
    if (term === undefined)
        term = lastTerm;
    lastTerm = term;
    let refs = {
        "gpa": function (a, b) { return parseFloat(b.gpa) - parseFloat(a.gpa); },
        "credit": function (a, b) { return parseFloat(b.credit) - parseFloat(a.credit); },
        "current_week_log": function (a, b) { return parseFloat(b.current_week_log) - parseFloat(a.current_week_log); },
        "promo": function (a, b) { return parseFloat(b.promo) - parseFloat(a.promo); },
    };
    let sorter = ((term in refs) ? refs[term] : function (a, b) { return (a[term] > b[term]) ? 1 : ((b[term] > a[term]) ? -1 : 0); });
    buildSortedLeaderboard(term, sorter, reverse)
}

var filter = [];
function appendRowIfFilter(n, newUser) {
    let str = "";
    for (u in newUser)
        str += newUser[u];
    str = str.toLowerCase();
    if (filter.length)
        for (let i = 0; i < filter.length; ++i)
            if (str.indexOf(filter[i]) < 0)
                return ;
    appendRow(n, newUser);
}

function buildSortedLeaderboard(term, sorter, reverse) {
    clearLeaderboard();
    users.sort(sorter);
    let count = 1;
    if (reverse) {
        users.reverse();
        for (let i = 0; i < users.length; ++i)
            if (users[i][term])
                count++;
    }
    for (let i = 0; i < users.length; ++i)
        if (users[i][term])
            appendRowIfFilter((reverse ? count-- : count++), users[i]);
    for (let i = 0; i < users.length; ++i)
        if (!users[i][term])
            appendRowIfFilter("?", users[i]);
}

$(document).ready(function () {
    $("#search-leaderboard").on("keyup", function () {
        filter = [];
        if ($(this).val().length)
            filter = $(this).val().toLowerCase().split(' ');
        buildSortedLeaderboardBy();
    });
});
