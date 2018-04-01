let user;
let users;

$(document).ready(function () {
    $.get("/api/user", function (data) {
        user = data.user;
        setUserFields();
        $.get("/api/users", function (data) {
            users = data.users;
            buildLeaderboard();

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
        let tab = '<tr login="' + users[i].email + '" class="center user-leaderboard">' +
            '<th class="center" scope="row">' + (i + 1) + '</th>' +
            '<td>' + firstName + '</td>' +
            '<td>' + lastName + '</td>' +
            '<td>' + users[i].city + '</td>' +
            '<td>' + users[i].promo + '</td>' +
            log + credit + gpa +
            '</tr>'
        $("#leaderboard-data").find('tbody').append(tab);
    }
    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
    alignCellsSize();
}

function sortLeaderboard(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("leaderboard-data");
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        for (i = 0; i < (rows.length - 1); i++) {
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
