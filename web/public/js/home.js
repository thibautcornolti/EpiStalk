
/* Replace all fields with the "get-upper-user" attribute with the user name. */
function setUserFields() {
    $.get("/api/user", function (data) {
        let name = data.user.email.split("@")[0].toUpperCase().replace(".", " ");
        $(".get-upper-user").text(name);
    }).fail(function (data, textStatus, xhr) {
        $(".get-upper-user").text("NaN");
    });
}

setUserFields();
function getAllUsers() {
    $.get("/users", function (data) {
        var arr = JSON.parse(JSON.stringify(data.users));
        console.log(arr);
        for (var i = 0; i < arr.length; i++) {
            let leaderboard = i + 1;
            let credit = arr[i].credit == undefined ? '?' : arr[i].credit;
            let gpa = arr[i].gpa == undefined ? '?' : arr[i].gpa;
            let log = arr[i].current_week_log == undefined ? '?' : arr[i].current_week_log;
            let lastName = arr[i].email.split('@')[0].split('.')[1].toUpperCase();
            let firstName = arr[i].email.split('.')[0].toUpperCase();
            let tab = '<tr class="center"><th class="center" scope="row">' +    leaderboard + '</th><td>' + 
                                                                                firstName + '</td><td>' + 
                                                                                lastName + '</td><td>' + 
                                                                                log + '</td><td>' + 
                                                                                credit + '</td><td>' + 
                                                                                gpa + '</td></tr>'
            $("#tableID").find('tbody').append(tab);
        };
    }).fail(function (data, textStatus, xhr) {
        //fail
    });
}