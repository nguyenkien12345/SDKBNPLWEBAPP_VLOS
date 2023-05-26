
function callAjax($data, $url, $type, $token = '') {
    options.Authorization = `Bearer ` + $token;
    try {
        let data = $.ajax({
            url: `${baseURL}/` + $url,
            method: $type,
            data: JSON.stringify($data),
            headers: options,
            async: false,
            dataType: 'json',
            beforeSend: function () {
                $('body').addClass('loading');
            },
            complete: function () {
                $('body').removeClass('loading');
            }
        });
        return data.responseJSON;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
};

function callAjaxEAP($data, $url, $type) {
    try {
        let data = $.ajax({
            url: `${baseURL_EAP}/` + $url,
            method: $type,
            data: JSON.stringify($data),
            async: false,
            dataType: 'json',
            beforeSend: function () {
                $('body').addClass('loading');
            },
            complete: function () {
                $('body').removeClass('loading');
            }
        });
        return data.responseJSON;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
};

function callAjaxMuleSoft($data, $url, $type) {
    try {
        let data = $.ajax({
            url: `${baseURL_MULESOFT}/` + $url,
            method: $type,
            data: $data,
            async: false,
            dataType: 'json',
            beforeSend: function () {
                $('body').addClass('loading');
            },
            complete: function () {
                $('body').removeClass('loading');
            }
        });
        return data.responseJSON;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
};


function checkPhoneExists(phone) {
    return callAjax({ phone: phone }, 'vlos/check-status-vlos', 'POST');
};

function checkNidExists(nid) {
    return callAjax({ nid: nid }, 'user/checkNidExists', 'POST');
};

function checkNidPhoneExists(phone, nid) {
    return callAjax({ phone: phone, nid: nid }, 'user/checkNidPhoneExists', 'POST');
};

function login(phone, pin) {
    return callAjax({ phone: phone, pin: pin }, 'user/login', 'POST');
};

function addInfoPersonal(name, sex, birthday, phone, citizenId, issueDate, expirationDate, city, district, ward, street, temporaryCity, temporaryDistrict, temporaryWard, temporaryStreet, personal_title_ref, name_ref, phone_ref, pin) {
    return callAjax(
        {
            name: name,
            sex: sex,
            birthday: birthday,
            phone: phone,
            citizenId: citizenId,
            issueDate: issueDate,
            expirationDate: expirationDate,
            city: city,
            district: district,
            ward: ward,
            street: street,
            temporaryCity: temporaryCity,
            temporaryDistrict: temporaryDistrict,
            temporaryWard: temporaryWard,
            temporaryStreet: temporaryStreet,
            personal_title_ref: personal_title_ref,
            name_ref: name_ref,
            phone_ref: phone_ref,
            pin: pin,
        },
        'personal/addInfoPersonal',
        'POST'
    );
};

function sendOtp(phone) {
    return callAjax({ phone: phone }, 'user/sendOtp', 'POST');
};

function verifyOtp(phone, otp) {
    return callAjax({ phone: phone, otp: otp }, 'user/verifyOtp', 'POST');
};

function sendOtpPin(phone, nid) {
    return callAjax({ phone: phone, nid: nid }, 'user/sendOtpPin', 'POST');
};

function verifyOtpPin(phone, nid, otp) {
    return callAjax({ phone: phone, nid: nid, otp: otp }, 'user/verifyOtpPin', 'POST');
};

function resetPin(phone, new_pin, token) {
    return callAjax({ phone: phone, new_pin: new_pin }, 'user/resetPin', 'PUT', token);
};

function updatePin(phone, pin, new_pin) {
    return callAjax({ phone: phone, pin: pin, new_pin: new_pin }, 'user/updatePin', 'PUT');
};

function updateStep(phone, process) {
    return callAjax({ phone: phone, process: process }, 'common/updateStep', 'PUT');
};

function getAllCity() {
    return callAjax({}, 'common/getAllCity', 'GET');
};

function getAllDistrict() {
    return callAjax({}, 'common/getAllDistrict', 'GET');
};

function getAllWard() {
    return callAjax({}, 'common/getAllWard', 'GET');
};

function getDetailDistricts(classificationCode) {
    return callAjax({ classificationCode: classificationCode }, 'common/getDistrict', 'POST');
};

function getDetailWards(classificationCode) {
    return callAjax({ classificationCode: classificationCode }, 'common/getWard', 'POST');
};

function getAllReferenceRelation() {
    return callAjax({}, 'common/getAllReferenceRelation', 'GET');
};

function getDetail(phone, token) {
    return callAjax({}, `personal/getInfomation/${phone}`, 'GET', token);
};

function requestRefreshToken(refreshToken) {
    return callAjax({ refreshToken: refreshToken }, 'user/requestRefreshToken', 'PUT');
};


// API EAP
function getAllProviders() {
    return callAjaxEAP({}, 'common/generateProviders', 'GET');
};

function getContract() {
    return callAjaxEAP({}, 'common/generateContract', 'GET');
};

// API MULESOFT FEC
function registration(transID, appID, fullname, gender, dob, nid, placeIssue, doi, phone, district, ward, street,
    city_temporary, district_temporary, ward_temporary, street_temporary,
    docNameSelfie, docNameSelfieContent, docNameNationalIDF, docNameNationalIDFContent, docNameNationalIDB, docNameNationalIDBContent,
    fullNameRef, referenceRelation, phoneRef, address_ocr, dob_ocr, doeNid_ocr, doiNid_ocr, socialStatusId
) {
    let sessionID = makeid(15);
    return callAjaxMuleSoft(
        {
            SessionID: sessionID ? sessionID : sessionID,
            applicationID: appID ? appID : "",
            partnerReferenceID: "",
            productSchemeID: "12123",
            fullName: fullname,
            firstName: "",
            middleName: "",
            lastName: "",
            gender: gender,
            dateOfBirth: dob,
            nationality: "1",
            occupation: "OTHERS",
            socialStatusId: socialStatusId,
            jobTitle: "OTHERS",
            nationalID: nid,
            placeIssue: placeIssue,
            dateIssue: doi,
            isPrimary: true,
            phoneType: "Mobile",
            phone: phone,
            isPrimaryPhone: true,
            type: "",
            houseType: "",
            country: "1",
            city: placeIssue,
            district: district,
            ward: ward,
            streetHamlet: street,
            city_temporary: city_temporary,
            district_temporary: district_temporary,
            ward_temporary: ward_temporary,
            street_temporary: street_temporary,
            buildingName: "",
            houseNumber: "",
            apartmentNumber: "",
            stayDurationMonths: 11,
            stayDurationYears: 22,
            docNameSelfie: docNameSelfie,
            docNameSelfieContent: docNameSelfieContent,
            docNameNationalIDF: docNameNationalIDF,
            docNameNationalIDFContent: docNameNationalIDFContent,
            docNameNationalIDB: docNameNationalIDB,
            docNameNationalIDBContent: docNameNationalIDBContent,
            fullNameRef: fullNameRef,
            phoneTypeRef: "MOBILE",
            referenceRelation: referenceRelation,
            phoneRef: phoneRef,
            address_ocr: address_ocr,
            dateOfBirth_ocr: dob_ocr,
            nationalIDExpiryDate_ocr: doeNid_ocr,
            nationalIDIssueDate_ocr: doiNid_ocr,
            gender_ocr: gender,
            nationalID_ocr: nid,
            name_ocr: fullname,
            province_ocr: placeIssue,
            custMonthlyNetIncome: 10000000
        },
        'registration',
        'POST'
    );
};

function checkBNPLInfo(nid, docTypeId, docName, docContent) {
    return callAjaxMuleSoft(
        {
            nationalID: nid,
            docTypeId: docTypeId,
            docName: docName,
            docContent: docContent,
            SessionID: "e6626f8d-aba9-47"
        },
        'checkBNPLInfo',
        'POST'
    );
};


function checkAccountInfo(accountNumber, totalAmount) {
    let sessionID = makeid(15);
    return callAjaxMuleSoft({}, `checkAccountInfo?SessionID=${sessionID}&AccountNumber=${accountNumber}&TotalAmount=${Number(totalAmount)}`, 'GET');
};

// API IFAME
function getIFrame(phone, isFaceAuth) {
    try {
        let info = {
            phone: phone,
            isFaceAuth: isFaceAuth
        };

        let options = {
            'x-api-key': 'Basic dGFnaXRfdXNlcjpwYXNzd29yZA==',
            'Content-Type': 'application/json',
            'Access-Control-All-Headers': 'Origin, Content-Type, X-Auth-Token , Authorization',
            'appKey': appKey,
            'appId': appId
        };

        let data = $.ajax({
            url: `${baseURL}/fec/postIframe`,
            method: 'POST',
            data: JSON.stringify(info),
            headers: options,
            async: false
        });
        return data.responseJSON;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
};

function addBillingInfo(merchantID, phone, provider, billID, inputAmount, trans_id) {
    return callAjax(
        {
            merchantID: merchantID,
            phone: phone,
            provider: provider,
            billID: billID,
            inputAmount: inputAmount,
            trans_id: trans_id
        },
        'common/addBillingInfo',
        'POST'
    );
};

function postTransaction(sessionID, AccountNumber) {
    return callAjax(
        {
            "SessionID": sessionID,
            "Vendor": "VOL",
            "AccountNumber": AccountNumber,
            "UserID": "001",
            "TotalAmount": Number(150000),
            "OrderDate": "2022-07-24",
            "SubOrder": [
                {
                    "SubOrderId": "OD0001",
                    "SkuID": "PD001",
                    "CategoryID": "01",
                    "Quantity": Number(1),
                    "Amount": Number(150000),
                    "MerchantID": "MC001"
                }
            ],
            "Tenor": Number(1),
            "AcquirerID": "00000016441",
            "MID": "123456789123456",
            "MCC": "1234",
            "Description": "Checkout order"
        },
        'fec/postTransaction',
        'POST'
    );
};

function getDetailDistrict(classificationCode) {
    return callAjax({}, `common/districts/${classificationCode}`, 'GET');
};

function getDetailWard(classificationCode) {
    return callAjax({}, `common/wards/${classificationCode}`, 'GET');
};

function getAllProvinceVlos() {
    return callAjax({}, `common/getAllAdress?province=province`, 'GET');
};

function getAllDistrictVlos() {
    return callAjax({}, `common/getAllAdress?district=district`, 'GET');
};

function getAllWardVlos() {
    return callAjax({}, `common/getAllAdress?ward=ward`, 'GET');
};

function getDistrictsByProvinceIdVlos(id) {
    return callAjax({}, `common/getDistrictVLOS/${id}`, 'GET');
};

function getWardsByDistrictIdVlos(id) {
    return callAjax({}, `common/getWardVLOS/${id}`, 'GET');
};


function callAPIDownload (data,contractID){
    return callAjax(data, `/vlos/download-contract-vlos/20230306113630-${contractID}-pdfContract`, 'GET');
}




function callAPIStartEsign (applicationID){
    return callAjax({}, `/vlos/start-esign-vlos?applicationId=${applicationID}`, 'GET');
}



function callAPIGenerateOTP (applicationID){
    return callAjax({}, `/vlos/generate-otp-vlos?applicationId=${applicationID}`, 'GET');
}





function callAPIVerifyOTP (applicationID, otp){
    return callAjax({}, `/vlos/verify-otp-vlos?applicationId=${applicationID}&otp=${otp}`, 'GET');
}



function callAPICancelVlos ( data,applicationID){
    return callAjax(data, `/vlos/cancel-vlos?applicationID=${applicationID}`, 'POST');
}






function callAPIInquiryStatusVlos(applicationID){
    return callAjax({}, `/vlos/inquiry-status-vlos?applicationID=${applicationID}`, 'POST');
}
   


function callBackVlos(data) {
    return callAjax(data, `/vlos/callback-vlos`, 'POST');
}





function callAPICheckFace(data) {
    return callAjax(data, `/vlos/face-vlos`, 'POST');
}


function getSignContract(applicationID) {
    return callAjax({}, `/vlos/get-esign-contract?applicationId=${applicationID}`, 'GET');
}





function checkData(data) {
    return callAjax(data, `/common/check-data`, 'POST');
}




function getContract(data) {
    return callAjax(data, `/vlos/get-contract-vlos`, 'POST');
}


function getCityVlos() {
    return callAjax({}, `/common/getCityVLOS`, 'GET');
}
 



function getDistrictVLOS(query){
    return callAjax({}, `/common/getDistrictVLOS/${query}`, 'GET');
}


function getWardVLOS(query){
    return callAjax({}, `/common/getWardVLOS/${query}`, 'GET');
}


function checkAddressValid(data) {
    return callAjax(data, `/common/checkAddressValid`, 'POST');
}


