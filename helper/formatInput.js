function showMessageStatus(input, message, status) {
    let parent = input.parentElement;
    let inputEle = parent.querySelector('input');
    let selectEle = parent.querySelector('select');
    let spanError = parent.querySelector('span');
    if (status !== null && status === 'ERROR') {
        if (inputEle) {
            inputEle.style.border = '1px solid #EE4D2D';
        }
        if (selectEle) {
            selectEle.style.border = '1px solid #EE4D2D';
        }
        spanError.innerText = message;
        // spanError.style.marginTop = '10px';
        spanError.style.textAlign = 'left';
        spanError.style.marginLeft = '0px';
        spanError.style.visibility = 'visible';
        spanError.style.opacity = '1';
    }
    else if (status !== null && status === 'SUCCESS') {
        if (inputEle) {
            inputEle.style.border = '1px solid #e4e2e2';
        }
        if (selectEle) {
            selectEle.style.border = '1px solid #e4e2e2';
        }
        spanError.innerText = '';
        // spanError.style.marginTop = '0px';
        spanError.style.marginLeft = '0px';
        spanError.style.visibility = 'hidden';
        spanError.style.opacity = '0';
    }
}

function formatStyleCorrectInput(data, errorMessage) {
    data.style.border = 'none';
    errorMessage.innerHTML = '';
    errorMessage.style.visibility = 'hidden';
    errorMessage.style.opacity = '0';
}

function formatStyleWrongInput(data, errorMessage, content) {
    data.style.border = '1px solid #EE4D2D';
    errorMessage.innerHTML = content;
    errorMessage.style.visibility = 'visible';
    errorMessage.style.opacity = '1';
}

function formatStyleWrongPincode(data, errorMessage, content) {
    errorMessage.innerHTML = content;
    errorMessage.style.visibility = 'visible';
    errorMessage.style.opacity = '1';
    errorMessage.style.marginBottom = '10px';
}

function addBorderStyle(data, color) {
    $(".pincode-input").val("");

    if (color !== null && color === 'RED') {
        if (data === 'otp') {
            for (i = 1; i <= 6; i++) {
                $("#otp" + i).addClass('error_otpcode_red');
            }
        }
        else if (data === 'pin') {
            for (i = 1; i <= 4; i++) {
                $("#pin" + i).addClass('error_pincode_red');
            }
        }
        else if (data === 'setuppin') {
            for (i = 1; i <= 4; i++) {
                $("#pin" + i).addClass('error_pincode_red');
            }
        }
        else if (data === 'setupcfpin') {
            for (i = 1; i <= 4; i++) {
                $("#pincf" + i).addClass('error_pincode_red');
            }
        }
    }

    if (color !== null && color === 'GRAY') {
        if (data === 'otp') {
            for (i = 1; i <= 6; i++) {
                $("#otp" + i).addClass('error_otpcode_gray');
            }
        }
        else if (data === 'pin') {
            for (i = 1; i <= 4; i++) {
                $("#pin" + i).addClass('error_pincode_gray');
            }
        }
        else if (data === 'setuppin') {
            for (i = 1; i <= 4; i++) {
                $("#pin" + i).addClass('error_pincode_gray');
            }
        }
        else if (data === 'setupcfpin') {
            for (i = 1; i <= 4; i++) {
                $("#pincf" + i).addClass('error_pincode_gray');
            }
        }
    }

    $('.pincode-input').removeClass('pincode-input--filled');
}

function formatStyleFocus(data) {
    data.style.border = '1px solid #197DDE';
}

function formatWrongOTP(errorMessage, message) {
    errorMessage.innerHTML = message;
    errorMessage.style.visibility = 'visible';
    errorMessage.style.opacity = '1';
}