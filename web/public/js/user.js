var user;
var puser;

$.urlParam = function (name) {
    let results = new RegExp('[\?&]' + name + '=([^&#]*)')
        .exec(window.location.href);
    return (results) ? results[1] : undefined;
}

$(document).ready(function () {
    $.get("/api/user", function (data) {
        user = data.user;
        paramLogin = $.urlParam("login");
        $.get("/api/user?login=" + (paramLogin ? paramLogin : user.email), function (data) {
            puser = data.user;
            setPuserFields();
            setPuserPictures();
            setRankView();
            setMarkView();
        });
        setUserFields();
        setLoginFields();
    });
});

function setRankView() {
    if (!user.show_rank)
        $(".rank-view").html('\
            <div class="text-center text-muted" style="margin-top: 10%;">\
                <h1 class="glyphicon glyphicon-eye-close"></h1>\
                <h4>Ranks are hidden until you share yours</h4>\
            </div>\
        ');
    else if (!puser.show_rank)
        $(".rank-view").html('\
            <div class="text-center text-muted" style="margin-top: 10%;">\
                <h1 class="glyphicon glyphicon-eye-close"></h1>\
                <h4>This user has hidden his ranks</h4>\
            </div>\
        ');
    else
        buildRankview(false);
    $(".rank-view").toggle(true);
}

function setMarkView() {
    if (!user.show_mark)
        $(".mark-view").html('\
            <div class="text-center text-muted" style="margin-top: 10%;">\
                <h1 class="glyphicon glyphicon-eye-close"></h1>\
                <h4>Marks are hidden until you share yours</h4>\
            </div>\
        ');
    else if (!puser.show_mark)
        $(".mark-view").html('\
            <div class="text-center text-muted" style="margin-top: 10%;">\
                <h1 class="glyphicon glyphicon-eye-close"></h1>\
                <h4>This user has hidden his marks</h4>\
            </div>\
        ');
    else
        buildMarkview(false);
    $(".mark-view").toggle(true);
}

function alignCellsSize(table) {
    $(document).ready(() => {
        let tdHeader = document.getElementById(table + "-table-header").rows[0].cells;
        let tdData = document.getElementById(table + "-table-data").rows[0].cells;
        for (let i = 0; i < tdData.length; i++)
            tdHeader[i].style.width = tdData[i].offsetWidth + 'px';
    });
}

function buildRankview(all) {
    let ranks = JSON.parse(puser.rank);
    let limit = (all || ranks.length <= 30) ? 0 : ranks.length - 30;
    $("#rank-table-data").find('tbody').html("");
    if (ranks.length > 0)
        for (let i = ranks.length - 1; i >= limit; i--) {
            let tab = '<tr class="center">' +
                '<td>' + ranks[i].date_ins.slice(0, 7) + '</td>' +
                '<td>' + ranks[i].codemodule + '</td>' +
                '<td>' + ranks[i].title + '</td>' +
                '<td>' + ranks[i].grade + '</td>' +
                '<td>' + ranks[i].credits + '</td>' +
                '</tr>'
            $("#rank-table-data").find('tbody').append(tab);
        }
    alignCellsSize("rank");
    sortView("rank-table-data", 0);
}

function buildMarkview(all) {
    function cl(data) {
        if (!data)
            return data;
        data = data.toString();
        let res = "";
        for (let o = 0; o < data.length; o++) {
            let cha = data.charAt(o)
            res += (cha == '"') ? '“' : cha;
        }
        return res;
    }
    function buildCellWithTooltip(data, tip, mark) {
        return '<td' + mark + '><div data-html="true" data-toggle="tooltip" title="' + cl(tip) + '">' + data + '</div></td>';
    }
    let marks = JSON.parse(puser.mark);
    let limit = (all || marks.length <= 30) ? 0 : marks.length - 30;
    $("#mark-table-data").find('tbody').html("");
    if (marks.length > 0)
        for (let i = marks.length - 1; i >= limit; i--) {
            let summary = '<b>Comment:</b><br>' + marks[i].comment + '<br>' +
                '<b>Examiner:</b><br>' + marks[i].correcteur + '<br>' +
                '<b>Date:</b><br>' + marks[i].date + '<br>' +
                '<b>Mark:</b><br>' + marks[i].final_note + '<br>' +
                '<b>Activity:</b><br>' + marks[i].title + ' (' + marks[i].codeacti + ')<br>' +
                '<b>Module:</b><br>' + marks[i].titlemodule + ' (' + marks[i].codemodule + ')<br>'
            let tab = '<tr class="center">' +
                '<td>' + marks[i].date.slice(0, 7) + '</td>' +
                buildCellWithTooltip(marks[i].codemodule, marks[i].titlemodule, '') +
                '<td>' + marks[i].title + '</td>' +
                buildCellWithTooltip(marks[i].final_note, summary, ' mark="' + marks[i].final_note + '"') +
                '</tr>'
            $("#mark-table-data").find('tbody').append(tab);
        }
    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
    alignCellsSize("mark");
    sortView("mark-table-data", 0);
}

function sortView(tableid, n) {
    function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(tableid);
    switching = true;
    dir = "desc";
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            if (rows[i].getElementsByTagName("TD")[n].hasAttribute("mark")) {
                x = parseInt(rows[i].getElementsByTagName("TD")[n].getAttribute("mark"));
                y = parseInt(rows[i + 1].getElementsByTagName("TD")[n].getAttribute("mark"));
            } else {
                x = rows[i].getElementsByTagName("TD")[n].innerHTML.toLowerCase();
                y = rows[i + 1].getElementsByTagName("TD")[n].innerHTML.toLowerCase();
                if (n)
                    if (x.indexOf("-") == 0)
                        x = (dir == "asc") ? "\255" : "\000";
                if (y.indexOf("-") == 0)
                    y = (dir == "desc") ? "\000" : "\255";
            }
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
            if (switchcount == 0 && dir == "desc") {
                dir = "asc";
                switching = true;
            }
        }
    }
}

$(document).ready(function () {
    $(window).on("resize", () => {
        alignCellsSize("rank");
        alignCellsSize("mark");
    });
    $("#search-rank").on("keyup", function () {
        var values = $(this).val().toLowerCase().split(' ');
        $("#rank-table-data tr").filter(function () {
            if (!$(this).hasClass("header-rankview")) {
                let show = true;
                for (let i = 0; i < values.length; ++i)
                    show = ($(this).text().toLowerCase().indexOf(values[i]) < 0) ? false : show;
                $(this).toggle(show);
            }
            alignCellsSize("rank");
        });
    });
    $("#search-mark").on("keyup", function () {
        var values = $(this).val().toLowerCase().split(' ');
        $("#mark-table-data tr").filter(function () {
            if (!$(this).hasClass("header-markview")) {
                let show = true;
                for (let i = 0; i < values.length; ++i)
                    show = ($(this).text().toLowerCase().indexOf(values[i]) < 0) ? false : show;
                $(this).toggle(show);
            }
            alignCellsSize("mark");
        });
    });
    $("#rank-show-all").on("click", function () {
        buildRankview(true);
    });
    $("#mark-show-all").on("click", function () {
        buildMarkview(true);
    });
});

/* Replace all pictures with the "user-picture" attribute with the user's picture. */
function setPuserPictures() {
    let url = "https://cdn.local.epitech.eu/userprofil/profilview/";
    if (user) {
        let name = puser.email.split("@")[0];
        $(".puser-picture").attr("src", url + name + ".png");
        if (user.email == "olivier.metzinger@epitech.eu")
            $(".puser-picture").attr("src", "https://i.imgur.com/2mX2Y7u.png");
        $(".puser-picture").toggle(true);
    }
}

/* Replace all fields with the "get-*-puser-*" attribute. */
function setPuserFields() {
    if (puser) {
        let name = puser.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-puser").text(name);
    }
    let refs = [["promo", ""], ["city", ""], ["gpa", "GPA"], ["current_week_log", "log time"], ["credit", "credits"]];
    for (let i = 0; i < refs.length; ++i)
        if (puser[refs[i][0]])
            $(".get-puser-" + refs[i][0]).text(puser[refs[i][0]]);
        else if (puser && user[refs[i][0]])
            $(".get-puser-" + refs[i][0]).html("<span data-toggle='tooltip' data-placement='top' title='This user has hidden his " + refs[i][1] + "'>?</span>");
        else if (puser)
            $(".get-puser-" + refs[i][0]).html("<span data-toggle='tooltip' data-placement='top' title='Share your " + refs[i][1] + " to see others!'><a href='/settings'>?</a></span>");
        else
            $(".get-puser-" + refs[i][0]).text("NaN");
    $(".puser-loading-hide").toggle(false);
    $(".puser-loading-show").toggle(true);
}

/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    if (user) {
        let name = user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    } else
        $(".get-upper-user").text("NaN");
}

/* Replace all fields with the "get-login" attribute with the login name. */
function setLoginFields() {
    if (user)
        $(".get-login").text(user.email);
    else
        $(".get-login").text("NaN");
}
