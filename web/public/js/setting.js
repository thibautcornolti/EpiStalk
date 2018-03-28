$("#change").on("click", changePassword);

function changePassword() {
    let password = $("#password").val();
    let passwordConfirm = $("#passwordConfirm").val();    
    $.post("/api/password", { password, passwordConfirm }, function (data) {
        console.log("success");
    }).fail(function (data, textStatus, xhr) {
        let res = JSON.parse(data.responseText);
        if (res.error)
            console.log(res.error);
        else if (res.warning)
            console.log(res.warning);
    });
}