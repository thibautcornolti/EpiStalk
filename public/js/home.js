var user;
var users;

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Object.size = function () {
    let count = 0;
    for (i in this)
        count++;
    return count;
};

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
            genDropdownFilter("promo");
            genDropdownFilter("city");
        })
    })
});

function enableLink() {
    $("#leaderboard tr").on("click", function () {
        if ($(this).hasClass("user-leaderboard"))
            $(location).attr("href", "/user?login=" + $(this).attr("login"))
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

function clearLeaderboard() {
    $("#leaderboard > tbody").html("");
}

var countLeaderboard;
var reverseLeaderboard;
function appendRow(n, newUser) {
    if (n === undefined)
        n = (reverseLeaderboard ? countLeaderboard-- : countLeaderboard++);
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

function showFilteredMessage() {
    $("#dropdown-filter-small").text("")
    for (let i in dropdownFilter) {
        if (dropdownFilter[i].length) {
            $("#dropdown-filter-small").text("Filter applied!")
            return ;
        }
    }
}

var filter = [];
var dropdownFilter = {};
function appendRowIfFilter(n, newUser) {
    let str = "";
    for (u in newUser)
        str += newUser[u];
    str = str.toLowerCase();
    if (filter.length)
        for (let i = 0; i < filter.length; ++i)
            if (str.indexOf(filter[i]) < 0)
                return;
    if (Object.size(dropdownFilter)) {
        let dropdownFilterMatch = {}
        for (name in dropdownFilter) {
            if (dropdownFilter[name].length) {
                for (let i = 0; i < dropdownFilter[name].length; ++i)
                    if (str.indexOf(dropdownFilter[name][i]) > -1)
                        dropdownFilterMatch[name] = 1;
            } else dropdownFilterMatch[name] = 1;
        }
        for (name in dropdownFilter) {
            if (!dropdownFilterMatch[name])
                return;
        }
        appendRow(n, newUser);
    } else appendRow(n, newUser);
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
    reverseLeaderboard = reverse;
    countLeaderboard = count;
    for (let i = 0; i < users.length; ++i)
        if (users[i][term])
            appendRowIfFilter(undefined, users[i]);
    for (let i = 0; i < users.length; ++i)
        if (!users[i][term])
            appendRowIfFilter("?", users[i]);
    enableLink();
    showFilteredMessage();
}

function addDropdownFilter(name, filter) {
    if (!dropdownFilter[name])
        dropdownFilter[name] = [];
    dropdownFilter[name].push(filter);
}

function removeDropdownFilter(name, filter) {
    if (!dropdownFilter[name])
        dropdownFilter[name] = [];
    for (let i = 0; i < dropdownFilter[name].length; ++i)
        if (dropdownFilter[name][i].indexOf(filter) == 0)
            dropdownFilter[name].remove(i);
}

function genDropdownFilter(name) {
    let rawVal = [];
    for (let i = 0; i < users.length; ++i)
        rawVal.push(users[i][name])
    let rawHtml = "";
    let val = Array.from(new Set(rawVal));
    val.sort();
    for (let i = 0; i < val.length; ++i)
        rawHtml = rawHtml + "<li><a href='#' vchecked='false' value='" + val[i] + "'>" + val[i] + "</a></li>"
    $("#dropdown-filter-" + name + " > ul").html(rawHtml);
    $(document).ready(function () {
        let eachRemaining = $("#dropdown-filter-" + name + " > ul > li").nextAll().length
        $("#dropdown-filter-" + name + " > ul > li").each(function () {
            let a = $(this).children("a");
            val = a.attr("value");
            if (user[name] && user[name].indexOf(val) == 0) {
                a.attr("vchecked", "true");
                a.html("<span class='glyphicon glyphicon-ok' style='margin-right: 10%;'></span>" + val);
                addDropdownFilter(name, val.toLowerCase());
            }
            if (--eachRemaining == 0) {
                buildSortedLeaderboardBy();
            }
        });
        $("#dropdown-filter-" + name + " > ul > li").on("click", function (e) {
            let a = $(this).children("a");
            val = a.attr("value");
            if (a.attr("vchecked").indexOf("true") == 0) {
                a.attr("vchecked", "false");
                a.html(val);
                removeDropdownFilter(name, val.toLowerCase());
            } else {
                a.attr("vchecked", "true");
                a.html("<span class='glyphicon glyphicon-ok' style='margin-right: 10%;'></span>" + val);
                addDropdownFilter(name, val.toLowerCase());
            }
            buildSortedLeaderboardBy();
            e.stopPropagation();
        });
    });
}

$(document).ready(function () {
    $("#search-leaderboard").on("keyup", function () {
        filter = [];
        if ($(this).val().length)
            filter = $(this).val().toLowerCase().split(' ');
        buildSortedLeaderboardBy();
    });
});
