
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
    var arr = users;
    console.log(arr);
    for (var i = 0; i < arr && arr.length; i++) {
        let leaderboard = i + 1;
        let credit = arr[i].credit == undefined ? '?' : arr[i].credit;
        let gpa = arr[i].gpa == undefined ? '?' : arr[i].gpa;
        let log = arr[i].current_week_log == undefined ? '?' : arr[i].current_week_log;
        let lastName = arr[i].email.split('@')[0].split('.')[1].toUpperCase();
        let firstName = arr[i].email.split('.')[0].toUpperCase();
        let tab = '<tr class="center"><th class="center" scope="row">' + leaderboard + '</th><td>' +
            firstName + '</td><td>' +
            lastName + '</td><td>' +
            log + '</td><td>' +
            credit + '</td><td>' +
            gpa + '</td></tr>'
        $("#tableID").find('tbody').append(tab);
    }
}
