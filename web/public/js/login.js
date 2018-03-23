$('.message a').click(function () {
    $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$("#btn").on("click", toggleAlert);
$('#bsalert').on('close.bs.alert', toggleAlert);

function toggleAlert() {
    $(".alert").toggleClass('in out');
    return false;
}

$('#login-form').submit(function() 
{
     if ($.trim($("#luser").val()) === "" || $.trim($("#lpass").val()) === "") {
        $(".alert").toggleClass('in out');
        return false;
    }
});
