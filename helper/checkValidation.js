function checkPhoneValidate(input) {
    const regexPhone = /^(09|03|07|08|05)+([0-9]{8}$)/;
    input.value = input.value.trim();
    let isPhoneErr = !regexPhone.test(input.value);
    if (regexPhone.test(input.value)) {
        showMessageStatus(input, '', 'SUCCESS');
    }
    else {
        showMessageStatus(input, lang.checkPhoneValidate.error_phone, 'ERROR');
    }
    return isPhoneErr;
}

function checkNidValidate(input) {
    const regexNid = /^\d{12}$|^\d{9}$/;
    input.value = input.value.trim();
    let isNidErr = !regexNid.test(input.value);
    if (regexNid.test(input.value)) {
        showMessageStatus(input, '', 'SUCCESS');
    }
    else {
        showMessageStatus(input, lang.checkNidValidate.error_nid, 'ERROR');
    }
    return isNidErr;
}

function checkPinValidate(input) {
    const regexPin = /^\d{4}$/;
    input.value = input.value.trim();
    let isPinErr = !regexPin.test(input.value);
    if (regexPin.test(input.value)) {
        showMessageStatus(input, '', 'SUCCESS');
    }
    else {
        showMessageStatus(input, lang.checkPinValidate.error_pin, 'ERROR');
    }
    return isPinErr;
}

function onChangeValidation(input, message) {
    changeColor(input);

    let element = document.querySelector(input);

    let value = element.value.trim();

    let parent = element.parentElement;

    let span = parent.querySelector('span');

    if (value !== null && value !== '') {
        element.style.border = 'none';
        span.innerText = '';
        span.style.marginTop = '0px';
        span.style.visibility = 'hidden';
        span.style.opacity = '0';
    }
    else {
        element.style.border = '1px solid #EE4D2D';
        span.innerText = message ? message : lang.onChangeValidation.type_info;
        span.style.visibility = 'visible';
        span.style.opacity = '1';
        span.style.marginTop = '0px';
        span.style.marginLeft = '0px';
    }
}

function checkEmptyError(listInput) {
    let isEmptyError = false;
    listInput.forEach(input => {
        input.value = input.value.trim();
        if (input.value) {
            isEmptyError = false;
            showMessageStatus(input, '', 'SUCCESS');
        }
        else {
            isEmptyError = true;
            showMessageStatus(input, lang.onChangeValidation.input_info, 'ERROR');
        }
    });
    return isEmptyError;
}