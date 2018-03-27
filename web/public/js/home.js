
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
    let credit;
    let log;
    let gpa;
    console.log(arr);
    for (var i = 0; i < arr.length; i++) {
        let leaderboard = i + 1;
        credit = (user.credit == undefined) ? credit = arr[i].credit == undefined ? ' data-toggle="tooltip" title="Tu n\'as pas partagé tes crédits">?' : '>' + arr[i].credit : credit = arr[i].credit == undefined ? ' data-toggle="tooltip" title="L\'utilisateur n\'a pas partagé ses crédits">?' : '>' + arr[i].credit;
        gpa = (user.gpa == undefined) ? gpa = arr[i].gpa == undefined ? ' data-toggle="tooltip" title="Tu n\'as pas partagé ton GPA">?' : '>' + arr[i].gpa : gpa = arr[i].gpa == undefined ? ' data-toggle="tooltip" title="L\'utilisateur n\'a pas partagé son GPA">?' : '>' + arr[i].gpa;
        log = (user.log == undefined) ? log = arr[i].current_week_log == undefined ? ' data-toggle="tooltip" title="Tu n\'as pas partagé ton log">?' : '>' + arr[i].current_week_log : log = arr[i].current_week_log == undefined ? ' data-toggle="tooltip" title="L\'utilisateur n\'a pas partagé son log">?' : '>' + arr[i].current_week_log;
        let lastName = arr[i].email.toUpperCase().split('@')[0].split('.')[1];
        let firstName = arr[i].email.split('.')[0].toUpperCase();
        let tab = '<tr class="center"><th class="center" scope="row">' + leaderboard + '</th><td>' +
        firstName + '</td><td>' +
        lastName + '</td><td' +
        log + '</td><td' +
        credit + '</td><td' +
        gpa + '</td></tr>'
        $("#tableID").find('tbody').append(tab);
    }
    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}
