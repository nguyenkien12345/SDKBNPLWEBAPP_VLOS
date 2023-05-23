function timer(remaining) {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;

    m = m < 10 ? ('0' + m) : (m);
    s = s < 10 ? ('0' + s) : (s);
    // m + ':' + s
    document.getElementById('timer').innerHTML = s + 's';
    remaining -= 1;

    if (remaining >= 0) {
        s = Number(s);
        if (s > 0) {
            $('#sendOtpAgain').addClass('disabled');
        }
        else if (s === 0 || s < 0) {
            $('#sendOtpAgain').removeClass('disabled');
        }
        setTimeout(function () {
            timer(remaining);
        }, 1000);
        return;
    }
}

function resetTimer(active) {
    if (active === true) {
        setTimeout(() => {
            $('#sendOtpAgain').removeClass('disabled');
        }, 61000);
    }
}
