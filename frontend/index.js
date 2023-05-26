const arrType_front = ["cccd_chip_front", "cccd_front", "cmnd_old_front"];
const arrType_back = ["cccd_chip_back", "cmnd_new_cccd_back", "cmnd_old_back"];
const regexPhone = /^(09|03|07|08|05)+([0-9]{8}$)/;
const regexNid = /^\d{12}$|^\d{9}$/;
let billTotal = 0;
let customer = { avatar: "./assets/img/avatar.png", limit: "150000", name: "Trung", };
let btnSelActive, btnFrontActive, btnBackActive = false;

function getQrcode() {
  let url_string = location.href;
  let url = new URL(url_string);
  let qrcode = url.searchParams.get("qrcode");
  if (qrcode) {
    sessionStorage.setItem('qrcode', qrcode);
  }
};

function closeLoading_clearInterval(x) {
  closeLoading();
  clearInterval(x);
};

function disabledE_disabledD(e) {
  if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD") {
    e.preventDefault();
    return false;
  }
};

function showCircularProgressbar(element, esign) {
  getQrcode();
  $(element).removeClass("element non-flex");

  let html = `<div class='box showCircularProgressbar' style='margin-top:200px'>
                    <div class='paragraph-text text-center margin-bottom-default'>
                    <div class="imgloading-140"></div>
                    <h2 class='sub2'>${lang.showCircularProgressbar.verifying}</h2>
                    <p style='text-align: center;'>
                        ${lang.showCircularProgressbar.note}
                    </p>
                    </div>
              </div>`;

  $(element).html(html).removeAttr("style");

  $("body").removeClass("loading");
  $("body").removeClass("pinalert");

  if (esign === true) {
    showProcessPipeline(3, true);
  }
  else {
    showProcessPipeline(4, true);
  }

  let phone = sessionStorage.getItem("phone");

  let myInterval = setInterval(function () {
    let result = checkPhoneExists(phone);
    if (result.statusCode === 1000 && result.status === true) {
      let step = result.data.step;
      if (result?.dataFEC?.Business_Status === 'REGISTRATION_FAILED') {
        messageScreen(element, { screen: "unsuccessScreen", pipeline: true });
        return;
      }
      if (step === 4) {
        let pin = "";
        if (sessionStorage.getItem("pin")) {
          pin = atob(sessionStorage.getItem("pin"));
        }
        if (pin) {
          let userLogin = login(phone, pin);
          if (userLogin) {
            sessionStorage.removeItem("pin");
            sessionStorage.setItem("phone", userLogin?.dataVOOLO?.phone);
            sessionStorage.setItem("token", btoa(userLogin?.dataVOOLO?.accessToken));
          }
          deleteStorageData();
          clearInterval(myInterval);
          messageScreen(element, { screen: "successScreen", pipeline: true });
        }
      }
      else if (step === 2) {
        let dataIframe = getIFrame(phone, false);
        if (dataIframe.code === 1 && dataIframe.progress === 'success' && dataIframe.esign_url) {
          deleteStorageData();
          clearInterval(myInterval);
          showContract(element, phone, false);
        }
      }
      else if (step === 0) {
        deleteStorageData();
        clearInterval(myInterval);
        messageScreen(element, { screen: "unsuccessScreen", pipeline: true });
      }
    }
  }, 5000);
};

function showUICheckPhone(element) {
  disableEnterKey();
  setRoute("showUICheckPhone");
  let html = `<form id='formValuePhone' class='formValue showUICheckPhone'>
                    <div class='mobile'>
                        <div class='form__row'>
                            <h5>${lang.showUICheckPhone.phone}</h5>
                            <label for='phone' class='text-b-m'>${lang.showUICheckPhone.type_phone}</label>
                            <input autocomplete="off" type='number' id='phone' class='form__input input-global' />
                            <span class='error_message'></span>
                        </div>
                        <button type='button' id='btnSubmitPhone' class='payment-button'>${lang.showUICheckPhone.button_next}</button>
                    </div>
              </form>`;
  $(element).html(html);

  configUi({
    element: element,
    logo: true,
    intro: true,
  });

  listProductions({
    element: element,
    items: true,
    dataItems: pData,
  });

  let dataPhone = document.querySelector("#phone");
  let errorMessage = document.querySelector(".error_message");
  let btnSubmitPhone = document.querySelector("#btnSubmitPhone");
  btnSubmitPhone.disabled = true;

  $("#phone").on("keypress", function (e) {
    disabledE_disabledD(e);
  });

  $("#phone").on("focus", function () {
    formatStyleCorrectInput(dataPhone, errorMessage);
    formatStyleFocus(dataPhone);
  });

  $("#phone").on("input", function () {
    dataPhone.value = dataPhone.value.slice(0, 10);
    let isPhoneErr = !regexPhone.test(dataPhone.value);

    if (dataPhone.value) {
      if (!isPhoneErr) {
        btnSubmitPhone.disabled = false;
        formatStyleCorrectInput(dataPhone, errorMessage);
      } else {
        btnSubmitPhone.disabled = true;
        formatStyleWrongInput(dataPhone, errorMessage, lang.showUICheckPhone.error_phone);
      }
    } else {
      btnSubmitPhone.disabled = true;
      formatStyleWrongInput(dataPhone, errorMessage, lang.showUICheckPhone.error_phone_null);
    }
  });

  $("#btnSubmitPhone").click(function () {
    showLoading();
    let x = setTimeout(() => {
      let data = dataPhone.value;
      sessionStorage.setItem("phone", data);
      let result = checkPhoneExists(data);
      if (result.status === true) {
        let step = result.data.stepVlos;
        closeLoading_clearInterval(x);
        let status = result.data.status;
        switch (step) {
          case 1:

            showUICheckNid(element);
            break;
          case 3:
          case 4:
          case 7:
            formatStyleWrongInput(dataPhone, errorMessage, messageStepVlos(status));
            break;
          case 2:
          case 5:
          case 6:
            showAllProvider(element, "REGISTERED_PHONE");
            break;
        }
      } else {
        let statusCode = result.data.statusCode;
        closeLoading_clearInterval(x);

        if (statusCode === 1003) {
          showUICheckNid(element);
        } else {
          btnSubmitPhone.disabled = true;
          switch (statusCode) {
            case 2222:
              console.log("statusCode 2222 :::", statusCode);
              // formatStyleWrongInput(dataPhone, errorMessage, lang.showUICheckPhone.error_phone);
              break;
            case 2223:
              console.log("statusCode 2223 :::", statusCode);
              // formatStyleWrongInput(dataPhone, errorMessage, "Thông tin của bạn bị từ chối đăng ký mua trước trả sau");
              break;
            case 2224:
              console.log("statusCode 2224 :::", statusCode);
              // formatStyleWrongInput(dataPhone, errorMessage, "Thông tin của bạn bị từ chối đăng ký mua trước trả sau. Vui lòng thử lại");
              break;
            case 2225:
              console.log("statusCode 2225 :::", statusCode);
              // formatStyleWrongInput(dataPhone, errorMessage, lang.showUICheckPhone.error_incorrect_OTP_5);
              break;
            case 2226:
              console.log("statusCode 2226 :::", statusCode);
              // formatStyleWrongInput(dataPhone, errorMessage, lang.showUICheckPhone.error_incorrect_pin_5);
              break;
            case 2227:
              console.log("statusCode 2227 :::", statusCode);
              // formatStyleWrongInput(dataPhone, errorMessage, lang.showUICheckPhone.error_incorrect_OTP_5);
              break;
          }
        }
      }

    }, 3000);
  });
};

function showUICheckNid(element) {
  disableEnterKey();
  setRoute("showUICheckNid");
  let html = `<form id='formValueNid' class='formValue showUICheckNid'>
                    <div class='mobile'>
                        <label>${lang.showUICheckNid.capture_selfie}</label>
                        <button type='button' id='callHP' class='btnCapture'></button>
                        <button type='button' id='btnSubmitNid' class='payment-button'>${lang.showUICheckPhone.button_next}</button>
                    </div>
              </form>`;
  $(element).html(html);

  pageTitle(element, "<h4 class='pageTitle'>" + lang.showUICheckNid.capture_selfie + "</h4>");
  $(window).scrollTop(0);

  // let dataNid = document.querySelector("#nid");
  // let errorMessage = document.querySelector(".error_message");
  let btnSubmitNid = document.querySelector("#btnSubmitNid");
  btnSubmitNid.disabled = true;

  $("#callHP").click(function () {
    showUseGuideSelfy();
  });
  // let isNidErr = false;
  // let isActive = false;

  // $("#nid").on("keypress", function (e) {
  //   disabledE_disabledD(e);
  // });

  // $("#nid").on("focus", function () {
  //   formatStyleFocus(dataNid);
  // });

  // $("#nid").on("input", function () {
  //   if (dataNid.value) {
  //     dataNid.value = dataNid.value.slice(0, 12);
  //     isNidErr = !regexNid.test(dataNid.value);
  //     if (!isNidErr) {
  //       isActive = true;
  //       formatStyleCorrectInput(dataNid, errorMessage);
  //     } else {
  //       isActive = false;
  //       formatStyleWrongInput(
  //         dataNid,
  //         errorMessage,
  //         lang.showUICheckNid.error_nid
  //       );
  //     }

  //     if (checkAllDataSame(dataNid.value)) {
  //       isActive = false;
  //       formatStyleWrongInput(
  //         dataNid,
  //         errorMessage,
  //         lang.showUICheckNid.error_nid
  //       );
  //     }
  //   } else {
  //     isActive = false;
  //     formatStyleWrongInput(
  //       dataNid,
  //       errorMessage,
  //       lang.showUICheckNid.error_nid_null
  //     );
  //   }


  //   if (isActive === true && btnSelActive === true) {
  //     btnSubmitNid.disabled = false;
  //   } else {
  //     btnSubmitNid.disabled = true;
  //   }
  // });
  $("#btnSubmitNid").click(function () {
    showLoading();
    let x = setTimeout(() => {
      // let data = $("#nid").val();
      // sessionStorage.setItem("nid", data);
      let checkSelfieImage = sessionStorage.getItem("selfie-image");
      // let result = checkNidExists(data);
      // if (
      //   result.statusCode === 1000 &&
      //   result.status === true &&
      //   checkSelfieImage !== null
      // ) {
      //   closeLoading_clearInterval(x);
      //   formatStyleWrongInput(
      //     dataNid,
      //     errorMessage,
      //     lang.showUICheckNid.error_nid_registered
      //   );
      //   btnSubmitNid.disabled = true;
      // } 
      // else if (
      //   result.statusCode === 900 &&
      //   result.status === false &&
      //   checkSelfieImage !== null
      // ) {
      //   closeLoading_clearInterval(x);
      //   showAllProvider(element, "UNREGISTERED_PHONE");
      //   let checkCustomer = {
      //     phone: sessionStorage.getItem("phone"),
      //     nid: sessionStorage.getItem("nid"),
      //     selfieImage: sessionStorage.getItem("selfie-image"),
      //   };
      //   sessionStorage.removeItem("front-image");
      //   sessionStorage.removeItem("back-image");
      //   sessionStorage.setItem("checkCustomer", JSON.stringify(checkCustomer));
      // } else if (result.statusCode === 8000 && result.status === false) {
      //   closeLoading_clearInterval(x);
      //   formatStyleWrongInput(
      //     dataNid,
      //     errorMessage,
      //     lang.showUICheckNid.error_nid
      //   );
      //   btnSubmitNid.disabled = true;
      // } else if (result.statusCode === 3001 && result.status === false) {
      //   closeLoading_clearInterval(x);
      //   formatStyleWrongInput(
      //     dataNid,
      //     errorMessage,
      //     "Thông tin của bạn bị từ chối đăng ký mua trước trả sau"
      //   );
      //   btnSubmitNid.disabled = true;
      // } else if (result.statusCode === 3002 && result.status === false) {
      //   closeLoading_clearInterval(x);
      //   formatStyleWrongInput(
      //     dataNid,
      //     errorMessage,
      //     "Thông tin của bạn bị từ chối đăng ký mua trước trả sau. Vui lòng thử lại"
      //   );
      //   btnSubmitNid.disabled = true;
      // }
      if (checkSelfieImage) {
        closeLoading_clearInterval(x);
        sessionStorage.removeItem("front-image");
        sessionStorage.removeItem("back-image");
        showAllProvider(element, "UNREGISTERED_PHONE");
      }
    }, 300);
  });
};

function captureNidFrontAndBack(element) {
  setRoute("captureNidFrontAndBack");
  let html = `<form class='formValue captureNidFrontAndBack' id="formValueNid">
                    <div class='buttons mobile'>
                        <label for='' class='title'>${lang.captureNidFrontAndBack.capture_nid}</label>
                        <div>
                        <button type='button' id='btnCaptureFront' class='btnCapture'><label class='caption'>${lang.captureNidFrontAndBack.capture_front_nid}</label></button>
                        <button type='button' id='btnCaptureBack' class='btnCapture'><label class='caption'>${lang.captureNidFrontAndBack.capture_back_nid}</label></button>
                        </div>
                        <button type='button' id='btnSubmit' class='payment-button'>${lang.showUICheckPhone.button_next}</button>
                    </div>
              </form>`;
  $(element).html(html);

  disableEnterKey();

  showProcessPipeline(1, true, "captureNid");
  pageTitle(element, "<h4 class='pageTitle'>" + lang.captureNidFrontAndBack.capture_nid + "</h4>");
  $(window).scrollTop(0);

  $("#btnCaptureFront").click(function () {
      showUseGuideNid();
  });

  $("#btnCaptureBack").click(function () {
    let front_image = sessionStorage.getItem("front-image");
    if (front_image) {
      runDocumentCaptureScreen("BACK");
    } else {
      showPopupMessage(`${lang.captureNidFrontAndBack.capture_nid}`, `${lang.captureNidFrontAndBack.capture_back_nid_before}`, `${lang.showPopupMessage.button_ok}`);
    }
  });

  let btnSubmit = document.querySelector("#btnSubmit");
  btnSubmit.disabled = true;

  if (btnFrontActive && btnBackActive) {
    btnSubmit.disabled = false;
  } else {
    btnSubmit.disabled = true;
  }

  $("#btnSubmit").click(function () {
    showLoading();
    let x = setTimeout(() => {
      let adn = JSON.parse(sessionStorage.getItem("allDataNid"));
      if (adn) {
        let phone = sessionStorage.getItem("phone");
        let fn = adn?.front_nid_customer;
        let bn = adn?.back_nid_customer;
        if (fn && bn) {
          closeLoading_clearInterval(x);
          let personal = new Personal(fn.name,
            fn.gender,
            phone,
            fn.dob,
            fn.idNumber,
            bn.doi,
            fn.doe ? fn.doe : bn.doe,
            fn.city,
            fn.district,
            fn.ward,
            fn.street
          );
          showDataInform("#voolo", personal);
        }
      }
    }, 300);
  });
};

async function matchField(value1, value2) {
  try {
    let transactionId = makeid(8) + '-' + makeid(4) + '-' + makeid(4) + '-' + makeid(4) + '-' + makeid(12);
    let data = $.ajax({
      type: "POST",
      url: "https://apac.docs.hyperverge.co/v1/matchFields",
      async: false,
      headers: {
        appId: appIdHV,
        appKey: appKeyHV,
        transactionId: transactionId,
      },
      data: JSON.stringify({
        id_number: {
          value1: value1,
          value2: value2,
        },
      }),
      contentType: "application/json",
    });
    return data.responseJSON;
  } catch (error) {
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

async function fetchToken() {
  try {
    const url = baseURL + "/fec/getHVToken";
    const data = await fetch(url);
    const json = await data.json();
    const { token } = json;
    return token;
  } catch (error) {
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

async function getHV() {
  try {
    await fetchToken().then((res) => {
      HyperSnapSDK.init(res, HyperSnapParams.Region.AsiaPacific);
      HyperSnapSDK.startUserSession();
    });
  } catch (error) {
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

function cutStringData(infomation) {
  try {
    if (infomation) {
      const { result } = infomation;
      const details = result?.details[0]?.fieldsExtracted;
      const nidType = result?.details[0]?.type;
      let front_nid_customer = "";
      let back_nid_customer = "";
      // FRONT NID IMAGE
      if (arrType_front.includes(nidType) && nidType) {
        sessionStorage.setItem("typeFrontNid", nidType);
        let province = details?.province?.value.trim() || "";
        let idNumber = details?.idNumber?.value.trim() || "";
        let name = details?.name?.value.trim() || "";
        let dob = details?.dob?.value.trim() || "";
        let homeTown = details?.homeTown?.value.trim() || "";
        let permanentAddress = details?.permanentAddress?.value.trim().split(",");
        let street = null;
        let ward = null;
        let district = null;
        let city = null;
        let length_permanentAddress = permanentAddress.length;
        if (length_permanentAddress > 4) {
          city = permanentAddress[length_permanentAddress - 1];
          district = permanentAddress[length_permanentAddress - 2];
          ward = permanentAddress[length_permanentAddress - 3];
          permanentAddress.forEach((str, i) => {
            if (i < length_permanentAddress - 3) {
              street += permanentAddress[i] + ",";
            }
          });
          street = street.replace(/null|,null|null,/g, '');
          street = street.slice(0, -1);
        }
        if (length_permanentAddress === 4) {
          city = permanentAddress[length_permanentAddress - 1];
          district = permanentAddress[length_permanentAddress - 2];
          ward = permanentAddress[length_permanentAddress - 3];
          street = permanentAddress[0];
        }
        if (length_permanentAddress === 3) {
          city = permanentAddress[length_permanentAddress - 1];
          district = permanentAddress[length_permanentAddress - 2];
          ward = permanentAddress[length_permanentAddress - 3];
          street = "";
        }
        if (city) {
          city = city.toLowerCase();
          if (city.includes("tỉnh")) {
            city = city.replace("tỉnh", "").trim();
          } else if (city.includes("thành phố")) {
            city = city.replace("thành phố", "").trim();
          } else if (city.includes("tp.")) {
            city = city.replace("tp.", "").trim();
          } else if (city.includes("tp")) {
            city = city.replace("tp", "").trim();
          } else if (city.includes("thủ đô")) {
            city = city.replace("thủ đô", "").trim();
          } else {
            city = city.trim();
          }
        }
        if (district) {
          district = district.toLowerCase();
          if (district.includes("huyện")) {
            district = district.replace("huyện", "").trim();
          } else if (district.includes("quận")) {
            district = district.replace("quận", "").trim();
          } else if (district.includes("thị xã")) {
            district = district.replace("thị xã", "").trim();
          } else if (district.includes("q.")) {
            district = district.replace("q.", "").trim();
          } else if (district.includes("thành phố")) {
            district = district.replace("thành phố", "").trim();
          } else {
            district = district.trim();
          }
        }
        if (ward) {
          ward = ward.toLowerCase();
          if (ward.includes("xã")) {
            ward = ward.replace("xã", "").trim();
          } else if (ward.includes("phường")) {
            ward = ward.replace("phường", "").trim();
          } else if (ward.includes("thị trấn")) {
            ward = ward.replace("thị trấn", "").trim();
          } else if (ward.includes("p.")) {
            ward = ward.replace("p.", "").trim();
          } else {
            ward = ward.trim();
          }
        };
        console.log('city: ', city);
        console.log('district: ', district);
        console.log('ward: ', ward);

        city = findCityVlos(city);
        console.log('city obj: ', city);
        let arrDistrict = findDistrictVlosByProvinceId(city.province_code);
        district = arrDistrict.data.find(x => (cleanDataDistrict(x.district).trim().toLowerCase().indexOf(district.trim().toLowerCase()) !== -1) || (district.trim().toLowerCase().indexOf(cleanDataDistrict(x.district).trim().toLowerCase()) !== -1));
        console.log('district obj: ', district);
        let arrWard = findWardVlosByDistrictId(district.district_code);
        ward = arrWard.data.find(x => (cleanDataWard(x.ward).trim().toLowerCase().indexOf(ward.trim().toLowerCase()) !== -1) || (ward.trim().toLowerCase().indexOf(cleanDataWard(x.ward).trim().toLowerCase()) !== -1));
        console.log('ward obj: ', ward);
        let gender = details?.gender?.value.trim() || "";
        let doe = details?.doe?.value.trim() || "";
        let nationality = details?.nationality?.value.trim() || "";
        makeFaceMatchCall(
          sessionStorage.getItem("selfie-image"),
          sessionStorage.getItem("front-image")
        ).then((data) => {
          if (data) {
            front_nid_customer = {
              province: province,
              idNumber: idNumber,
              name: name,
              dob: dob,
              homeTown: homeTown,
              street: street,
              ward: ward,
              district: district,
              city: city,
              gender: gender,
              doe: doe,
              nationality: nationality,
            };
            sessionStorage.setItem("front_nid_customer", JSON.stringify(front_nid_customer));
            showUseGuideBackNid();
          } else {
            showPopupMessage(`${lang.cutStringData.notification}`, `${lang.cutStringData.error_capture_front_nid}`, `${lang.showPopupMessage.button_back}`);
          }
        });
      }
      // BACK NID IMAGE
      if (arrType_back.includes(nidType) && nidType) {
        sessionStorage.setItem("typeBackNid", nidType);
        let typeBackNid = sessionStorage.getItem("typeBackNid");
        let typeFrontNid = sessionStorage.getItem("typeFrontNid");
        if ((typeFrontNid === "cccd_chip_front" && typeBackNid === "cccd_chip_back") || (typeFrontNid === "cccd_front" && typeBackNid === "cmnd_new_cccd_back") || (typeFrontNid === "cmnd_old_front" && typeBackNid === "cmnd_old_back")) {
          let doi = details?.doi?.value.trim() || "";
          let placeOfIssue = details?.placeOfIssue?.value.trim() || "";
          if (typeBackNid === "cmnd_old_back") {
            let doe = details?.doe?.value.trim() || "";
            back_nid_customer = {
              doe: doe,
              doi: doi,
              placeOfIssue: placeOfIssue,
            };
          } else {
            back_nid_customer = {
              doi: doi,
              placeOfIssue: placeOfIssue,
            };
          }
          sessionStorage.setItem("back_nid_customer", JSON.stringify(back_nid_customer));
        }
      }
    }

    let fnc = JSON.parse(sessionStorage.getItem("front_nid_customer"));
    let bnc = JSON.parse(sessionStorage.getItem("back_nid_customer"));

    if (fnc !== null && bnc !== null) {
      let allDataNid = {
        front_nid_customer: fnc,
        back_nid_customer: bnc,
      };
      sessionStorage.setItem("allDataNid", JSON.stringify(allDataNid));
    }
  } catch (error) {
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

function makeFaceMatchCall(faceImageBase64String, docImageBase64String) {
  callback = (HVError, HVResponse) => {
    if (HVError) {
      let errorCode = HVError.getErrorCode();
      let errorMessage = HVError.getErrorMessage();
    }
    if (HVResponse) {
      let apiResults = HVResponse.getApiResult();
      let apiHeaders = HVResponse.getApiHeaders();
      if (apiResults !== null) {
        const data = apiResults?.result;
        const matchFace = data?.match;
        if (matchFace === "no") {
          showPopupMessage(lang.cutStringData.notification, lang.makeFaceMatchCall.error_selfie_notmatch, lang.showPopupMessage.button_back);
          return false;
        } else {
          return true;
        }
      }
    }
  };
  return HVNetworkHelper.makeFaceMatchCall(faceImageBase64String, docImageBase64String, {}, {}, callback);
};


let hvFaceConfig = new HVFaceConfig();

async function LaunchFaceCaptureScreen() {
  try {

    hvFaceConfig.setShouldShowInstructionPage(false);
    hvFaceConfig.faceTextConfig.setFaceCaptureTitle(lang.LaunchFaceCaptureScreen.capture_selfie);
    hvFaceConfig.faceTextConfig.setFaceCaptureBottomDescription(lang.LaunchFaceCaptureScreen.use_phone);
    hvFaceConfig.faceTextConfig.setFaceNotDetectedDescription(lang.LaunchFaceCaptureScreen.capture_rules);
    hvFaceConfig.faceTextConfig.setFaceTooBigDescription(lang.LaunchFaceCaptureScreen.away_camera);
    hvFaceConfig.faceTextConfig.setFaceDetectedDescription(lang.LaunchFaceCaptureScreen.capture_now);
    hvFaceConfig.faceTextConfig.setFaceCaptureReviewTitle(lang.LaunchFaceCaptureScreen.capture_review);
    hvFaceConfig.faceTextConfig.setFaceCaptureReviewBottomDescription(lang.LaunchFaceCaptureScreen.FaceCaptureReviewBottomDescription);
    $("body").removeClass("loading");
    close_popup();
    callback = (HVError, HVResponse) => {
      if (HVError) {
        let errorCode = HVError.getErrorCode();
        let errorMessage = HVError.getErrorMessage();
      }
      if (HVResponse) {
        let apiResults = HVResponse.getApiResult();
        let apiHeaders = HVResponse.getApiHeaders();
        let imageBase64 = HVResponse.getImageBase64();
        let attemptsCount = HVResponse.getAttemptsCount();
        if (imageBase64) {
          $(".guideslide").remove();
          $("#formValueNid").show();
          $("body").find(".pageTitle").text(lang.LaunchFaceCaptureScreen.capture_selfie);
          sessionStorage.setItem("selfie-image", imageBase64);
          showCapture(imageBase64, "callHP");
          close_popup();
        }
      }
    };
    HVFaceModule.start(hvFaceConfig, callback);
  } catch (error) {
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

async function LaunchDocumentCaptureScreen(side) {
  try {
    let hvDocConfig = new HVDocConfig();
    hvDocConfig.setShouldShowInstructionPage(false);
    hvDocConfig.setShouldShowDocReviewScreen(false);
    hvDocConfig.docTextConfig.setDocCaptureReviewTitle(lang.LaunchDocumentCaptureScreen.capture_nid);
    hvDocConfig.docTextConfig.setDocCaptureBottomDescription(lang.LaunchDocumentCaptureScreen.choose_place);
    $("body").removeClass("loading");
    close_popup();
    let applyFrontNid = side === "FRONT" && side !== "BACK" && side !== "";
    let applyBackNid = side === "BACK" && side !== "FRONT" && side !== "";
    if (applyFrontNid) {
      hvDocConfig.docTextConfig.setDocCaptureTitle(lang.LaunchDocumentCaptureScreen.capture_front);
      hvDocConfig.setOCRDetails("https://vnm-docs.hyperverge.co/v2/nationalID", hvDocConfig.DocumentSide.FRONT, {}, {});
    } else if (applyBackNid) {
      hvDocConfig.docTextConfig.setDocCaptureTitle(lang.LaunchDocumentCaptureScreen.capture_back);
      hvDocConfig.setOCRDetails("https://vnm-docs.hyperverge.co/v2/nationalID", hvDocConfig.DocumentSide.BACK, {}, {});
    }
    callback = (HVError, HVResponse) => {
      if (HVError) {
        let errorCode = HVError.getErrorCode();
        let errorMessage = HVError.getErrorMessage();
      }
      if (HVResponse) {
        let apiResults = HVResponse.getApiResult();
        let apiHeaders = HVResponse.getApiHeaders();
        let imageBase64 = HVResponse.getImageBase64();
        let attemptsCount = HVResponse.getAttemptsCount();
        if (apiResults["result"]["summary"]["action"] !== "pass") {
          showPopupMessage(lang.cutStringData.notification, lang.LaunchDocumentCaptureScreen.Unsatisfactory_picture, lang.showPopupMessage.button_ok);
        }
        if (imageBase64) {
          $(".guideslide").remove();
          $(".guideslideback").remove();
          $("#formValueNid").show();
          $("body").find(".pageTitle").text(lang.LaunchDocumentCaptureScreen.capture_nid);
          if (applyFrontNid) {
            sessionStorage.setItem("front-image", imageBase64);
            showCapture(imageBase64, "btnCaptureFront");
            cutStringData(apiResults);
          } else if (applyBackNid) {
            sessionStorage.setItem("back-image", imageBase64);
            showCapture(imageBase64, "btnCaptureBack");
            cutStringData(apiResults);
            close_popup();
          }
        }
      }
    };
    HVDocsModule.start(hvDocConfig, callback);
  } catch (error) {
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

function runFaceCaptureScreen() {
  showLoading();
  try {
    getHV().then(() => LaunchFaceCaptureScreen());
  } catch (error) {
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

function runDocumentCaptureScreen(side) {
  showLoading();
  try {
   
    getHV().then(() => {
      console.log("runDocumentCaptureScreen");
      LaunchDocumentCaptureScreen(side);
    });
  } catch (error) {
    console.log(error);
    return {
      errorCode: error.status || 500,
      errorMessage: error.message,
    };
  }
};

async function showAllTenor(element) {
  setRoute("showAllTenor");
  $(element).removeClass().removeAttr("style");
  $(element).removeClass("non-flex").removeAttr("style");

  let phone = sessionStorage.getItem("phone");
  let token = atob(sessionStorage.getItem("token"));
  let infoCustomer = getDetail(phone, token);
  let accountNumber = infoCustomer?.data?.dataFEC?.dataFEC?.AccountNo;
  sessionStorage.setItem('AccountNo', accountNumber);
  let sessionID = infoCustomer?.data?.dataFEC?.dataFEC?.SessionID;
  sessionStorage.setItem('SessionID', sessionID);
  let totalAmount = 150000;

  let isCheckAccountInfo = await checkAccountInfo(accountNumber, totalAmount);

  let isActiveAccount = isCheckAccountInfo?.data?.AccountInfo;
  let otb = isActiveAccount?.OTB;

  sessionStorage.setItem('SessionIDCheckAccountInfo', isActiveAccount?.SessionID);
  sessionStorage.setItem('AccountNumberCheckAccountInfo', isActiveAccount?.AccountNumber);

  let tenors = [];

  if (isActiveAccount) {
    tenors = isActiveAccount?.OfferTenorList;
  }

  let html = "";
  if (otb >= totalAmount && tenors) {
    html += `<form class='formValue orderTop box-mobile box-tenor'> <div style="margin-bottom:24px" class='sub2'>${lang.showAllTenor.select_payment_term}</div>`;

    for (let i = 0; i < tenors.length; i++) {
      html += `
        <div class='voolo-intro tenor-list' data-id='${i}' onclick='selectTenor(this)'>
            <div class='tenor-item'>
                <div class="tenor-head">
                    <div class='sub4'>${lang.showAllTenor.term_1 + " " + (i + 1)}</div class='sub4'>
                    <h5 class='totalprice'>${formatCurrency(parseInt(tenors[i].EMI.EMI))}</h5>
                </div>
                <ul>
                    <li>${lang.showAllTenor.payment_time} ${Number(tenors[i].Tenor * 30)} ${lang.showAllTenor.payment_type}</li>
                    <li>${lang.showAllTenor.product_price} ${formatCurrency(totalAmount)}</li>
                    <li>${lang.showAllTenor.conversion_fee} ${formatCurrency(tenors[i].EMI.EMI_ConversionFee)}</li>
                </ul>
                <p></p>
            </div>
        </div>`;
    }

    if (tenors.length > 3)
      html += `<a onclick='showAllTenor("${element}")' class='ahref'>${lang.showAllTenor.show_more}</a>`;
    html += `<button type='button' id='btnContinue' class='payment-button medium'>${lang.showUICheckPhone.button_next}</button></form>`;

    $(element).html(html);

    const btnContinue = document.querySelector("#btnContinue");
    btnContinue.disabled = true;

    disableEnterKey();

    // show list productions
    listProductions({
      element: element,
      items: true,
      dataItems: pData,
    });

    customerInfo(element);

    $("#btnContinue").click(function () {
      showFormPincode(element, phone, 'BUY_SUCCESS');
    });
  } else if (otb < totalAmount && tenors) {
    $(element).html("");
    customerInfo(element);
  }
  else {
    $(element).html("");
    customerInfo(element);
  }
  sessionStorage.removeItem('qrcode');
};

function showAllProvider(element, type) {
  getQrcode();
  disableEnterKey();
  const data = getAllProviders();
  let providers = data.data;
  console.log(providers);
  if (providers.length > 1) {
    let html = `<div class='box showAllProvider'><div class='paragraph-text text-center margin-bottom-default'><h6>${lang.showAllProvider.choose_provider}</h6></div>`;
    for (let i = 0; i < providers.length; i++) {
      html += `
        <div class='list-provider'>
            <button type='button' class='btnSelectProvider' onclick='selectProvider("${element}", "${type}")' data-id='${providers[i]._id}'><img src='${providers[i].url}' /></button>
        </div>`;
    }
    html += `</div>`;
    $(element).html(html);
  }
  else {
    if (type) {
      if (type === "REGISTERED_PHONE") {
        let data = sessionStorage.getItem("phone");
        showFormPincode(element, data, 'VERIFY_PIN');
      } else if (type === "UNREGISTERED_PHONE") {
        captureNidFrontAndBack(element);
      }
    }
  }
};

function selectTenor(el) {
  disableEnterKey();
  $(".tenor-list").removeClass("active");
  $(el).closest("div.tenor-list").addClass("active");
  //validation button
  let btnSubmitPin = document.querySelector("#btnContinue");
  btnSubmitPin.disabled = false;
};

function selectProvider(element, type) {
  showLoading();
  disableEnterKey();
  let x = setTimeout(() => {
    if (type) {
      if (type === "REGISTERED_PHONE") {
        closeLoading_clearInterval(x);
        let data = sessionStorage.getItem("phone");
        showFormPincode(element, data, 'VERIFY_PIN');
      } else if (type === "UNREGISTERED_PHONE") {
        closeLoading_clearInterval(x);
        captureNidFrontAndBack(element);
      }
    }
  }, 500);
};

function onHandleChangeDataCity() {
  onChangeValidation("#city", `${lang.onHandleChangeDataCity.input_city}`);
  setTimeout(function () {
    handleChangeCityVlos("#city", "#district", lang.showDataInform.choose_district);
  }, 0);
};

function onHandleChangeDataDistrict() {
  onChangeValidation("#district", `${lang.onHandleChangeDataCity.input_district}`);
  setTimeout(function () {
    handleChangeDistrictVlos("#district", "#ward", lang.showDataInform.choose_ward);
  }, 0);
};

function onHandleChangeDataCityPermanent() {
  onChangeValidation("#city_permanent", `${lang.onHandleChangeDataCity.input_city}`);
  setTimeout(function () {
    handleChangeCityVlos("#city_permanent", "#district_permanent", lang.showDataInform.choose_district);
  }, 0);
};

function onHandleChangeDataDistrictPermanent() {
  onChangeValidation("#district_permanent", `${lang.onHandleChangeDataCity.input_district}`);
  setTimeout(function () {
    handleChangeDistrictVlos("#district_permanent", "#ward_permanent", lang.showDataInform.choose_ward);
  }, 0);
};

function showDataInform(element, personal) {
  disableEnterKey();
  setRoute("showDataInform");
  let adn = JSON.parse(sessionStorage.getItem("allDataNid"));
  if (adn) {
    let fn = adn?.front_nid_customer;
    let bn = adn?.back_nid_customer;
    if (fn && bn) {
      personal = new Personal(fn.name, fn.gender, sessionStorage.getItem("phone"), fn.dob, fn.idNumber, bn.doi, fn.doe ? fn.doe : bn.doe, fn.city, fn.district, fn.ward, fn.street);
    }
  }

  let cities = getAllProvinceVlos();
  let districts = getAllDistrictVlos();
  let wards = getAllWardVlos();

  let referencesRelation = getAllReferenceRelation();
  showHeader();
  let fullname = personal.fullname || "";
  let conditionFullname = personal.fullname ? true : false;
  let phone = personal.phone || "";
  let conditionPhone = personal.phone ? true : false;
  let dob = convertDateString(personal.dob) || "";
  let conditionDob = convertDateString(personal.dob) ? true : false;
  let gender = personal.gender || "";
  let genM = gender === "M" ? "selected" : "";
  let genF = gender === "F" ? "selected" : "";
  let conditionGender = personal.gender ? true : false;
  let nid = personal.nid || "";
  let conditionNid = personal.nid ? true : false;
  let doi = convertDateString(personal.doi) || "";
  let conditionDoi = convertDateString(personal.doi) ? true : false;
  let doe = convertDateString(personal.doe) || "";
  let conditionDoe = convertDateString(personal.doe) ? true : false;
  let city = personal.city || "";
  let conditionCity = personal.city ? true : false;
  let district = personal.district || "";
  let conditionDistrict = personal.district ? true : false;
  let ward = personal.ward || "";
  let conditionWard = personal.ward ? true : false;
  let street = personal.street || "";
  let conditionStreet = personal.street ? true : false;
  let language = sessionStorage.getItem("lang");

  console.log('city: ', city);
  console.log('conditionCity: ', conditionCity);
  console.log('district: ', district);
  console.log('conditionDistrict: ', conditionDistrict);
  console.log('ward: ', ward);
  console.log('conditionWard: ', conditionWard);

  let showCity = null;
  let showDistrict = null;
  let showWard = null;

  cities.data.map((dtcity, index) => { showCity += `<option key=${index} value='${dtcity.province_code}' ${city ? city.province_code === dtcity.province_code && "selected" : ""}>${dtcity.province}</option>` });
  districts.data.map((dtdistrict, index) => { showDistrict += `<option key=${index} value='${dtdistrict.district_code}' ${district ? district.district_code === dtdistrict.district_code && "selected" : ""}>${dtdistrict.district}</option>` });
  wards.data.map((dtward, index) => { showWard += `<option key=${index} value='${dtward.ward_code}' ${ward ? ward.ward_code === dtward.ward_code && "selected" : ""}>${dtward.ward}</option>` });

  let html = `<div class='form-card form-showdata'>
                    <h4 class='form-showdata-title'>${lang.showDataInform.input_info}</h4>
                    <p class='form-showdata-desc'>${lang.showDataInform.fill_fields_below}</p>
                    <form class='' id='formDataValue'>
                        <div class="card">
                            <div class="card-head">
                                <h3 class='form-showdata-info sub4'>${lang.showDataInform.info}</h3>
                            </div>
                            <div class="card-body">
                                <div class='form-row'>
                                    <label for='fullname'>${lang.showDataInform.info_name}</label>
                                    <input class='input-global' autocomplete="off" type='text' id='fullname' name='fullname' onClick='onChangeValidation("#fullname", "${lang.showDataInform.input_name}")' value="${conditionFullname ? fullname : ""}" ${conditionFullname ? "disabled" : ""} />
                                    <span class='error_fullname error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <label for='phone'>${lang.showDataInform.info_phone}</label>
                                    <input class='input-global' autocomplete="off" type='text' id="phone" name="phone" onClick='onChangeValidation("#phone", "${lang.showDataInform.input_phone}")' value="${conditionPhone ? phone : ""}"  ${conditionPhone ? "disabled" : ""} />
                                    <span class='error_phone error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <label for='dob'>${lang.showDataInform.info_birth}</label>
                                    <input placeholder="dd/mm/yyyy" class='input-global' autocomplete="off" type='date' id='dob' name='dob' onchange='onChangeValidation("#dob", "${lang.showDataInform.input_birth}")' onClick='onChangeValidation("#dob", "${lang.showDataInform.input_birth}")' value="${conditionDob ? dob : ""}" ${conditionDob ? "disabled" : ""} style='max-width:191px' />
                                    <span class='error_dob error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <label for='gender'>${lang.showDataInform.info_gender}</label>
                                    <select id='gender' name='gender' class="input-global ${conditionGender ? "" : "default-gray"}" autocomplete="off" onchange='onChangeValidation("#gender", "${lang.showDataInform.input_gender}")' onClick='onChangeValidation("#gender", "${lang.showDataInform.input_gender}")' ${conditionGender ? "disabled" : ""} style='max-width:139px'>
                                    <option value="" class="first_option" disabled selected>${lang.showDataInform.choose_gender}</option>
                                    <option value="M" ${genM}>${lang.showDataInform.gender_man}</option>
                                    <option value="F" ${genF}>${lang.showDataInform.gender_woman}</option>
                                    </select>
                                    <span class='error_gender error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <label for='nid'>${lang.showDataInform.nid}</label>
                                    <input class='input-global' autocomplete="off" type='text' id='nid' name='nid' onClick='onChangeValidation("#nid","${lang.showDataInform.input_nid}")' value="${conditionNid ? replaceData(nid) : ""}" ${conditionNid ? "disabled" : ""} />
                                    <span class='error_nid error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <div class='mobile-cell'>
                                        <div class="form-cell">
                                            <label for='doi'>${lang.showDataInform.doi}</label>
                                            <input placeholder="dd/mm/yyyy" class='input-global' autocomplete="off" type='date' id='doi' name='doi' onchange='onChangeValidation("#doi","${lang.showDataInform.input_doi}")' onClick='onChangeValidation("#doi", "${lang.showDataInform.input_doi}")' value="${conditionDoi ? doi : ""}" />
                                            <span class='error_doi error_message'></span>
                                        </div>
                                    </div>
                                    <div class='mobile-cell'>
                                        <div class="form-cell">
                                            <label for='doe'>${lang.showDataInform.doe}</label>
                                            <input placeholder="dd/mm/yyyy" class='input-global' autocomplete="off" type='date' id='doe' name='doe' onchange='onChangeValidation("#doe", "${lang.showDataInform.input_doe}")' onClick='onChangeValidation("#doe", "${lang.showDataInform.input_doe}")' value="${conditionDoe ? doe : ""}" />
                                            <span class='error_doe error_message'></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer"></div>
                        </div> 
                        <div class="card">
                            <div class="card-head">
                                <h3 class='form-showdata-info'>${lang.showDataInform.res_address}</h3>
                            </div>
                            <div class="card-body">
                                <div class='form-row'>
                                    <label for='city'>${lang.showDataInform.city}</label>
                                    <select id='city' name='city' class="input-global ${conditionCity ? "" : "default-gray"}" autocomplete="off" onchange='onHandleChangeDataCity()' onClick='onHandleChangeDataCity()' value="${conditionCity && city ? city.province_code : ""}">
                                    <option value="" class="first_option" disabled selected>${lang.showDataInform.choose_city}</option>
                                    ${showCity}
                                    </select>
                                    <span class='error_city error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <label for='district'>${lang.showDataInform.district}</label>
                                    <select id='district' name='district' class="input-global ${conditionDistrict ? "" : "default-gray"}" autocomplete="off" onchange='onHandleChangeDataDistrict()' onClick='onHandleChangeDataDistrict()' value="${conditionDistrict && district ? district.district_code : ""}">
                                    <option value="" class="first_option" style="${conditionDistrict && district ? " display: none" : "display: block"}" disabled selected>${lang.showDataInform.choose_district}</option>
                                    ${showDistrict}
                                    </select>
                                    <span class='error_district error_message'></span>
                                </div>
                                <div class='form-row'>
                                  <label for='ward'>${lang.showDataInform.ward}</label>
                                  <select id='ward' name='ward' class="input-global ${conditionWard ? "" : "default-gray"}" autocomplete="off" onchange='onChangeValidation("#ward", "${lang.showDataInform.input_ward}")' onClick='onChangeValidation("#ward", "${lang.showDataInform.input_ward}")' value="${conditionWard && ward ? ward.ward_code : ""}">
                                    <option value="" class="first_option" style="${conditionWard && ward ? " display: none" : "display: block"}" disabled selected>${lang.showDataInform.choose_ward}</option>
                                    ${showWard}
                                  </select>
                                  <span class='error_ward error_message'></span>
                                </div>
                                <div class='form-row'>
                                  <label for='street'>${lang.showDataInform.street}</label>
                                  <input class='input-global' autocomplete="off" type='text' id='street' name='street' onchange='onChangeValidation("#street", "${lang.showDataInform.input_street}")' value="${conditionStreet ? street : ""}" />
                                  <span class='error_street error_message'></span>
                                </div>
                            </div>
    <div class="card-footer"></div>
                        </div> 
                        <div class="card">
                        <div class="card-head">
                            <h3 class='form-showdata-info'>${lang.showDataInform.cur_address} <input type="checkbox" id="copy-address" /></h3>
                        </div>
                        <div class="card-body">
                            <div class='form-row'>
                                <label for='city_permanent'>${lang.showDataInform.city}</label>
                                <select id='city_permanent' name='city_permanent' class='input-global default-gray' autocomplete="off" onchange='onHandleChangeDataCityPermanent()' onClick='onHandleChangeDataCityPermanent()'>
                                    <option value="" class="first_option" disabled selected>${lang.showDataInform.choose_city}</option>
                                    ${cities.data.map((city, index) => `<option key=${index} value='${city.province_code}'>${city.province}</option>`)}
                                </select>
                                <span class='error_city_permanent error_message'></span>
                            </div> 
                            <div class='form-row'>
                                <label for='district_permanent'>${lang.showDataInform.district}</label>
                                <select id='district_permanent' name='district_permanent' class='input-global default-gray' autocomplete="off" onchange='onHandleChangeDataDistrictPermanent()' onClick='onHandleChangeDataDistrictPermanent()'>
                                    <option value="" class="first_option" disabled selected>${lang.showDataInform.choose_district}</option>
                                    </select>
                                <span class='error_district_permanent error_message'></span>
                            </div>
                            <div class='form-row'>
                                <label for='ward_permanent'>${lang.showDataInform.ward}</label>
                                <select id='ward_permanent' name='ward_permanent' class='input-global default-gray' autocomplete="off" onchange='onChangeValidation("#ward_permanent","${lang.showDataInform.input_ward}")' onClick='onChangeValidation("#ward_permanent","${lang.showDataInform.input_ward}")'>
                                    <option value="" class="first_option" disabled selected>${lang.showDataInform.choose_ward}</option>
                                    </select>
                                <span class='error_ward_permanent error_message'></span>
                            </div>
                            <div class='form-row'>
                                <label for='street_permanent'>${lang.showDataInform.street}</label>
                                <input class='input-global' autocomplete="off" type='text' id='street_permanent' name='street_permanent' onchange='onChangeValidation("#street_permanent", "${lang.showDataInform.input_street}")' onClick='onChangeValidation("#street_permanent", "${lang.showDataInform.input_street}")'/>
                                <span class='error_street_permanent error_message'></span>
                            </div>
                        </div> 
                        <div class="card-footer"></div>
                    </div> 
                        <div class="card">
                            <div class="card-head">
                                <h3 class='form-showdata-info'>${lang.showDataInform.reference_info}</h3>
                            </div>
                            <div class="card-body">
                                <div class='form-row'>
                                    <label for='relationship'>${lang.showDataInform.relationship}</label>
                                    <select id='relationship' name='relationship' class='input-global default-gray' autocomplete="off" onchange='onChangeValidation("#relationship", "${lang.showDataInform.input_relation}")' onClick='onChangeValidation("#relationship", "${lang.showDataInform.input_relation}")'>
                                        <option value=""  class="first_option">${lang.showDataInform.choose_relation}</option>
                                        ${referencesRelation.data.map((reference, index) => `<option key='${index}' value='${reference["Value"]}'>${language === "en" ? reference["Translate"] : reference["Text"]}</option>`)}
                                    </select>
                                    <span class='error_relationship error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <label for='fullname_ref'>${lang.showDataInform.info_name_ref}</label>
                                    <input class='input-global' autocomplete="off" type='text' id="fullname_ref" name="fullname_ref" onchange='onChangeValidation("#fullname_ref", "${lang.showDataInform.input_name_ref}")' onClick='onChangeValidation("#fullname_ref", "${lang.showDataInform.input_name_ref}")' />
                                    <span class='error_fullname_ref error_message'></span>
                                </div>
                                <div class='form-row'>
                                    <label for='phone_ref'>${lang.showDataInform.info_phone_ref}</label>
                                    <input class='input-global' autocomplete="off" type='text' id='phone_ref' name='phone_ref' onchange='onChangeValidation("#phone_ref", "${lang.showDataInform.input_phone_ref}")' onClick='onChangeValidation("#phone_ref", "${lang.showDataInform.input_phone_ref}")' />
                                    <span class='error_phone_ref error_message'></span>
                                </div>
                            </div>
                            <div class="card-footer"></div>
                        </div>
                        <button type='submit' class='payment-button medium' id='btnContinue'>${lang.showUICheckPhone.button_next}</button>
                    </form>
                </div> `;
  $(element).html(html).removeClass("captureNid");

  //show progress bar
  showProcessPipeline(1, true, "showDataInform");
  pageTitle(element, "<h4 class='pageTitle'>" + lang.showDataInform.capture_selfie + "</h4>", "non-pageTitle");
  close_popup();

  /* fix error safari input[type=date] - by UNO 19/07 */
  let ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf("safari") != -1) {
    if (ua.indexOf("chrome") > -1) {
    } else {
    }
  }
  $(window).scrollTop(0);

  let fullnameEle = document.getElementById("fullname");
  let genderEle = document.getElementById("gender");
  let phoneEle = document.getElementById("phone");
  let dobEle = document.getElementById("dob");
  let nidEle = document.getElementById("nid");
  let doiELe = document.getElementById("doi");
  let doeEle = document.getElementById("doe");
  let cityEle = document.getElementById("city");
  let districtEle = document.getElementById("district");
  let wardEle = document.getElementById("ward");
  let streetEle = document.getElementById("street");
  let relationshipEle = document.getElementById("relationship");
  let fullname_refEle = document.getElementById("fullname_ref");
  let phone_refEle = document.getElementById("phone_ref");
  let city_permanentEle = document.getElementById("city_permanent");
  let district_permanentEle = document.getElementById("district_permanent");
  let ward_permanentEle = document.getElementById("ward_permanent");
  let street_permanentEle = document.getElementById("street_permanent");

  let btnContinue = document.getElementById("btnContinue");
  btnContinue.disabled = true;

  let isActiveData = false;
  let isActivePhoneRef = false;

  let isPhoneErr;

  let fields = document.querySelectorAll('.input-global');

  $('.input-global').on('input', function () {
    $("#phone_ref").on("input", function () {
      phoneEle.value = phoneEle.value.slice(0, 10).trim();
      phone_refEle.value = phone_refEle.value.slice(0, 10).trim();
      isPhoneErr = !regexPhone.test(phone_refEle.value);

      if (phone_refEle.value) {
        if (!isPhoneErr) {
          isActivePhoneRef = true;
          showMessageStatus(phone_refEle, '', 'SUCCESS');
          if (isActivePhoneRef === true && isActiveData === true) {
            btnContinue.disabled = false;
          }
        } else {
          isActivePhoneRef = false;
          showMessageStatus(phone_refEle, lang.showDataInform.error_phone, 'ERROR');
          btnContinue.disabled = true;
        }
      } else {
        isActivePhoneRef = false;
        showMessageStatus(phone_refEle, lang.showDataInform.input_phone_ref, 'ERROR');
        btnContinue.disabled = true;
      }

      if (phone_refEle.value.length === 10) {
        if (phoneEle.value === phone_refEle.value) {
          isActivePhoneRef = false;
          showMessageStatus(phone_refEle, lang.showDataInform.error_same_phone, 'ERROR');
          btnContinue.disabled = true;
        }
        else {
          isActivePhoneRef = true;
          showMessageStatus(phone_refEle, '', 'SUCCESS');
        }
      }
      else if (phone_refEle.value.length !== 10) {
        isActivePhoneRef = false;
        showMessageStatus(phone_refEle, lang.showDataInform.error_phone, 'ERROR');
      }
    });

    for (var i = 0; i < fields.length - 1; i++) {
      if (fields[i].value) {
        isActiveData = true;
      }
      else {
        isActiveData = false;
        break;
      }
    }

    if (isActiveData === true && isActivePhoneRef === true) {
      btnContinue.disabled = false;
    }
    else {
      btnContinue.disabled = true;
    }
  });


  $("#phone_ref").on("keypress", function (e) {
    disabledE_disabledD(e);
  });

  const formDataValue = document.querySelector("#formDataValue");

  formDataValue.addEventListener("submit", function (e) {
    e.preventDefault();

    let fullnameVal = fullnameEle.value.trim();
    let genderVal = genderEle.options[genderEle.selectedIndex].value;
    let phoneVal = phoneEle.value.trim();
    let dobVal = dobEle.value.trim();
    let nidVal = personal.nid;
    let doiVal = doiELe.value.trim();
    let doeVal = doeEle.value.trim();
    let cityVal = cityEle.options[cityEle.selectedIndex].value;
    let districtVal = districtEle.options[districtEle.selectedIndex].value;
    let wardVal = wardEle.options[wardEle.selectedIndex].value;
    let cityText = cityEle.options[cityEle.selectedIndex].text;
    let districtText = districtEle.options[districtEle.selectedIndex].text;
    let wardText = wardEle.options[wardEle.selectedIndex].text;
    let streetVal = streetEle.value.trim();
    let relationshipVal = relationshipEle.options[relationshipEle.selectedIndex].value;
    let relationshipText = relationshipEle.options[relationshipEle.selectedIndex].text;
    let fullname_refVal = fullname_refEle.value.trim();
    let phone_refVal = phone_refEle.value.trim();
    let city_permanentVal = city_permanentEle.options[city_permanentEle.selectedIndex].value;
    let district_permanentVal = district_permanentEle.options[district_permanentEle.selectedIndex].value;
    let ward_permanentVal = ward_permanentEle.options[ward_permanentEle.selectedIndex].value;
    let city_permanentText = city_permanentEle.options[city_permanentEle.selectedIndex].text;
    let district_permanentText = district_permanentEle.options[district_permanentEle.selectedIndex].text;
    let ward_permanentText = ward_permanentEle.options[ward_permanentEle.selectedIndex].text;
    let street_permanentVal = street_permanentEle.value.trim();

    let isCheckEmpty = checkEmptyError([
      fullnameEle,
      genderEle,
      phoneEle,
      dobEle,
      nidEle,
      doiELe,
      doeEle,
      cityEle,
      districtEle,
      wardEle,
      streetEle,
      relationshipEle,
      fullname_refEle,
      phone_refEle,
      city_permanentEle,
      district_permanentEle,
      ward_permanentEle,
      street_permanentEle,
    ]);

    let personal_all_infoConfirm = {
      name: fullnameVal,
      sex: genderVal,
      birthday: dobVal,
      phone: phoneVal,
      citizenId: nidVal,
      issueDate: doiVal,
      city: {
        cityVal: cityVal,
        cityText: cityText,
      },
      district: {
        districtVal: districtVal,
        districtText: districtText,
      },
      ward: {
        wardVal: wardVal,
        wardText: wardText,
      },
      street: streetVal,
      personal_title_ref: {
        relationshipVal: relationshipVal,
        relationshipText: relationshipText,
      },
      name_ref: fullname_refVal,
      phone_ref: phone_refVal,
      temporaryCity: {
        city_permanentVal: city_permanentVal,
        city_permanentText: city_permanentText,
      },
      temporaryDistrict: {
        district_permanentVal: district_permanentVal,
        district_permanentText: district_permanentText,
      },
      temporaryWard: {
        ward_permanentVal: ward_permanentVal,
        ward_permanentText: ward_permanentText,
      },
      temporaryStreet: street_permanentVal,
      expirationDate: doeVal,
    };

    if (!isCheckEmpty) {
      if (phone_refVal !== phoneVal) {
        if (personal_all_infoConfirm !== null) {
          sessionStorage.setItem("personal_all_infoConfirm", JSON.stringify(personal_all_infoConfirm));
          $(element).removeClass("showDataInform");
          showConfirmDataInform(element, personal_all_infoConfirm);
        }
      }
    }
  });

  $("#copy-address").on("click", function () {

    let city = $("#city").val();
    $("#city_permanent").val(city);
    $("#city_permanent").removeClass("default-gray");

    let district = $("#district").val();
    $("#district_permanent").append($('<option>', {
      value: district,
      text: $("#district option:selected").text(),
      selected: true
    }));
    $("#district_permanent").removeClass("default-gray");

    $("#ward_permanent").append($('<option>', {
      value: $("#ward option:selected").val(),
      text: $("#ward option:selected").text(),
      selected: true
    }));
    $("#ward_permanent").removeClass("default-gray");

    $("#street_permanent").val($("#street").val());
    $(this).attr("disabled", true);
  });
};

function showConfirmDataInform(element, personal_all_infoConfirm) {
  disableEnterKey();
  let nid = replaceData(personal_all_infoConfirm.citizenId);
  let html = `<div class='form-card form-confirmdata'>
                    <h4 class='form-confirmdata-title'>${lang.showConfirmDataInform.check_info}</h4>
                    <p class='form-confirmdata-desc'>${lang.showConfirmDataInform.confirm_info}</p>
                    <form class=''>
                        <div class="card">
                            <div class="card-head">
                                <div class='form-showdata-info sub4'>${lang.showDataInform.info}</div>
                            </div>
                            <div class="card-body">
                                <div class='form-row form-verify'>
                                    <label for='name'>${lang.showDataInform.info_name}</label>
                                    <div id='name' class="info">${personal_all_infoConfirm.name}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='phone'>${lang.showDataInform.info_phone}</label>
                                    <div id='phone' class="info">${personal_all_infoConfirm.phone}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='birthday'>${lang.showDataInform.info_birth}</label>
                                    <div id='birthday' class="info">${convertDateString2(personal_all_infoConfirm.birthday)}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='gender'>${lang.showDataInform.info_gender}</label>
                                    <div id='gender' class="info">${sessionStorage.getItem("lang") === "en" ? personal_all_infoConfirm.sex === "M" ? "Male" : "Female" : personal_all_infoConfirm.sex === "M" ? "Nam" : "Nữ"}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='citizenId'>${lang.showDataInform.nid}</label>
                                    <div id='citizenId' class="info">${nid}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='issueDate'>${lang.showDataInform.doi}</label>
                                    <div id='issueDate' class="info">${convertDateString2(personal_all_infoConfirm.issueDate)}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='doe'>${lang.showDataInform.doe}</label>
                                    <div id='doe' class="info">${convertDateString2(personal_all_infoConfirm.expirationDate)}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='address'>${lang.showDataInform.cur_address}</label>
                                    <div id='address' class="info">${personal_all_infoConfirm.street}, ${personal_all_infoConfirm.ward.wardText}, ${personal_all_infoConfirm.district.districtText}, ${personal_all_infoConfirm.city.cityText}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='address'>${lang.showDataInform.res_address}</label>
                                    <div id='address' class="info">${personal_all_infoConfirm.temporaryStreet}, ${personal_all_infoConfirm.temporaryWard.ward_permanentText}, ${personal_all_infoConfirm.temporaryDistrict.district_permanentText}, ${personal_all_infoConfirm.temporaryCity.city_permanentText}</div>
                                </div>
                            </div> 
                            <div class="card-footer"></div>
                        </div> 
                        <div class="card" style="display:none">
                            <div class="card-head">
                                <div class="form-showdata-info sub4">${lang.showDataInform.res_address}</div>
                            </div>
                            <div class="card-body">
                                <div class='form-row form-verify'>
                                    <label for='city_permanent'>${lang.showDataInform.city}</label>
                                    <div id='city_permanent' class="info">${personal_all_infoConfirm.temporaryCity.city_permanentText}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='district_permanent'>${lang.showDataInform.district}</label>
                                    <div id='district_permanent' class="info">${personal_all_infoConfirm.temporaryDistrict.district_permanentText}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='ward_permanent'>${lang.showDataInform.wards}</label>
                                    <div id='ward_permanent' class="info">${personal_all_infoConfirm.temporaryWard.ward_permanentText}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='street_permanent'>${lang.showDataInform.street}</label>
                                    <div id='street_permanent' class="info">${personal_all_infoConfirm.temporaryStreet}</div>
                                </div>
                            </div>
                            <div class="card-footer"></div>
                        </div>
                        <div class="card">
                            <div class="card-head">
                                <div class="form-showdata-info sub4">${lang.showDataInform.reference_info}</div>
                            </div>
                            <div class="card-body">
                                <div class='form-row form-verify'>
                                    <label for='relationship'>${lang.showDataInform.relationship}</label>
                                    <div id='relationship' class="info">${personal_all_infoConfirm.personal_title_ref.relationshipText}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='name_ref'>${lang.showDataInform.info_name_ref}</label>
                                    <div id='name_ref' class="info">${personal_all_infoConfirm.name_ref}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='phone_ref'>${lang.showDataInform.info_phone_ref}</label>
                                    <div id='phone_ref' class="info">${personal_all_infoConfirm.phone_ref}</div>
                                </div>
                            </div>
                            <div class="card-footer"></div>
                        </div>
                    </form>
                </div>
    <div class="form-row">
      <button type='button' class='payment-button btn-previous' onclick='window.location.reload();'>${lang.showConfirmDataInform.button_back}</button>
      <button type='submit' class='payment-button medium' id='btnContinueConfirm'>${lang.showConfirmDataInform.button_confirm}</button>
    </div>`;
  $(element).html(html);

  showProcessPipeline(1, true, "showConfirmDataInform");
  pageTitle(element, "<h4 class='pageTitle'>" + lang.showDataInform.input_info + "</h4>");
  $(window).scrollTop(0);

  let personal_all_info = {
    name: personal_all_infoConfirm.name,
    sex: personal_all_infoConfirm.sex,
    birthday: personal_all_infoConfirm.birthday,
    phone: personal_all_infoConfirm.phone,
    citizenId: personal_all_infoConfirm.citizenId,
    issueDate: personal_all_infoConfirm.issueDate,
    city: personal_all_infoConfirm.city.cityVal,
    district: personal_all_infoConfirm.district.districtVal,
    ward: personal_all_infoConfirm.ward.wardVal,
    street: personal_all_infoConfirm.street,
    personal_title_ref: personal_all_infoConfirm.personal_title_ref.relationshipVal,
    name_ref: personal_all_infoConfirm.name_ref,
    phone_ref: personal_all_infoConfirm.phone_ref,
    temporaryCity: personal_all_infoConfirm.temporaryCity.city_permanentVal,
    temporaryDistrict: personal_all_infoConfirm.temporaryDistrict.district_permanentVal,
    temporaryWard: personal_all_infoConfirm.temporaryWard.ward_permanentVal,
    temporaryStreet: personal_all_infoConfirm.temporaryStreet,
    expirationDate: personal_all_infoConfirm.expirationDate,
  };

  sessionStorage.setItem("personal_all_info", JSON.stringify(personal_all_info));

  $("#btnContinueConfirm").click(function () {
    showLoading();
    let x = setTimeout(() => {
      closeLoading();
      clearInterval(x);
      showFormSetupPin(element, "SHOW_LOGIN");
    }, 500);
  });
};

function showReviewDataInform(element, personal_all_infoConfirm) {
  disableEnterKey();
  let nid = replaceData(personal_all_infoConfirm.data.citizenId);
  let html = `<div class='form-card form-confirmdata form-reviewdata'>
                    <h4 class='form-confirmdata-title'>${lang.showConfirmDataInform.check_info}</h4>
                    <p class='form-confirmdata-desc'>${lang.showConfirmDataInform.confirm_info}</p>
                    <form class=''>
                        <div class="card">
                            <div class="card-head">
                                <div class='form-showdata-info sub4'>${lang.showDataInform.info}</div>
                            </div>
                            <div class="card-body">
                                <div class='form-row form-verify'>
                                    <label for='name'>${lang.showDataInform.info_name}</label>
                                    <div id='name' class="info">${personal_all_infoConfirm.data.name}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='phone'>${lang.showDataInform.info_phone}</label>
                                    <div id='phone' class="info">${personal_all_infoConfirm.data.phone}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='birthday'>${lang.showDataInform.info_birth}</label>
                                    <div id='birthday' class="info">
                                    ${new Date(personal_all_infoConfirm.data.birthday).getDate()}/${new Date(personal_all_infoConfirm.data.birthday).getMonth() + 1}/${new Date(personal_all_infoConfirm.data.birthday).getFullYear()}
                                    </div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='gender'>${lang.showDataInform.info_gender}</label>
                                    <div id='gender' class="info">${sessionStorage.getItem("lang") === "en" ? personal_all_infoConfirm.data.sexData.value === "M" ? "Male" : "Famale" : personal_all_infoConfirm.data.sexData.value === "M" ? "Nam" : "Nữ"}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='citizenId'>${lang.showDataInform.nid}</label>
                                    <div id='citizenId' class="info">
                                    ${nid}
                                    </div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='issueDate'>${lang.showDataInform.doi}</label>
                                    <div id='issueDate' class="info">
                                    ${new Date(personal_all_infoConfirm.data.issueDate).getDate()}/${new Date(personal_all_infoConfirm.data.issueDate).getMonth() + 1}/${new Date(personal_all_infoConfirm.data.issueDate).getFullYear()}
                                    </div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='doe'>${lang.showDataInform.doe}</label>
                                    <div id='doe' class="info">
                                    ${new Date(personal_all_infoConfirm.data.expirationDate).getDate()}/${new Date(personal_all_infoConfirm.data.expirationDate).getMonth() + 1}/${new Date(personal_all_infoConfirm.data.expirationDate).getFullYear()}
                                    </div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='address'>${lang.showDataInform.cur_address}</label>
                                    <div id='address' class="info">${personal_all_infoConfirm.data.street}, ${personal_all_infoConfirm.data.wardData.Name}, ${personal_all_infoConfirm.data.districtData.Name}, ${personal_all_infoConfirm.data.cityData.Name}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='address'>${lang.showDataInform.res_address}</label>
                                    <div id='address' class="info">${personal_all_infoConfirm.data.temporaryStreet}, ${personal_all_infoConfirm.data.wardTempData.Name}, ${personal_all_infoConfirm.data.districtTempData.Name}, ${personal_all_infoConfirm.data.cityTempData.Name}</div>
                                </div>
                            </div> 
                            <div class="card-footer"></div>
                        </div> 
                        <div class="card" style="display:none">
                            <div class="card-head">
                                <div class="form-showdata-info sub4">${lang.showDataInform.res_address}</div>
                            </div>
                            <div class="card-body">
                                <div class='form-row form-verify'>
                                    <label for='city_permanent'>${lang.showDataInform.city}</label>
                                    <div id='city_permanent' class="info">${personal_all_infoConfirm.data.cityTempData.UI_Show}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='district_permanent'>${lang.showDataInform.district}</label>
                                    <div id='district_permanent' class="info">${personal_all_infoConfirm.data.districtTempData.UI_Show}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='ward_permanent'>${lang.showDataInform.wards}</label>
                                    <div id='ward_permanent' class="info">${personal_all_infoConfirm.data.wardTempData.UI_Show}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='street_permanent'>${lang.showDataInform.street}</label>
                                    <div id='street_permanent' class="info">${personal_all_infoConfirm.data.temporaryStreet}</div>
                                </div>
                            </div>
                            <div class="card-footer"></div>
                        </div>
                        <div class="card">
                            <div class="card-head">
                                <div class="form-showdata-info sub4">${lang.showDataInform.reference_info}</div>
                            </div>
                            <div class="card-body">
                                <div class='form-row form-verify'>
                                    <label for='relationship'>${lang.showDataInform.relationship}</label>
                                    <div id='relationship' class="info">${personal_all_infoConfirm.data.personalTitleRef.Text}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='name_ref'>${lang.showDataInform.info_name_ref}</label>
                                    <div id='name_ref' class="info">${personal_all_infoConfirm.data.name_ref}</div>
                                </div>
                                <div class='form-row form-verify'>
                                    <label for='phone_ref'>${lang.showDataInform.info_phone_ref}</label>
                                    <div id='phone_ref' class="info">${personal_all_infoConfirm.data.phone_ref}</div>
                                </div>
                            </div>
                            <div class="card-footer"></div>
                        </div>
                        <button type='button' class='payment-button medium' id='btnContinueConfirm'>${lang.showConfirmDataInform.button_confirm}</button>
                    </form>
              </div> `;
  $(element).html(html);

  $(window).scrollTop(0);

  $("#btnContinueConfirm").click(function () {
    showLoading();
    let x = setTimeout(() => {
      // let dataRegistrationReSubmit = registration(personal_all_infoConfirm.data.dataFEC.TransID, personal_all_infoConfirm.data.dataFEC.AppID, personal_all_infoConfirm.data.name, personal_all_infoConfirm.data.sexData.value,
      //     new Date(personal_all_infoConfirm.data.birthday).toISOString().split('T')[0],
      //     personal_all_infoConfirm.data.citizenId, personal_all_infoConfirm.data.cityData.Value,
      //     new Date(personal_all_infoConfirm.data.issueDate).toISOString().split('T')[0],
      //     personal_all_infoConfirm.data.phone, personal_all_infoConfirm.data.districtData.Value, personal_all_infoConfirm.data.wardData.Value, personal_all_infoConfirm.data.street,
      //     personal_all_infoConfirm.data.cityTempData.Value, personal_all_infoConfirm.data.districtTempData.Value, personal_all_infoConfirm.data.wardTempData.Value, personal_all_infoConfirm.data.temporaryStreet,
      //     personal_all_infoConfirm.data.selfie_image.fileName, personal_all_infoConfirm.data.selfie_image.imageBase64,
      //     personal_all_infoConfirm.data.nid_front_image.fileName, personal_all_infoConfirm.data.nid_front_image.imageBase64,
      //     personal_all_infoConfirm.data.nid_back_image.fileName, personal_all_infoConfirm.data.nid_back_image.imageBase64,
      //     personal_all_infoConfirm.data.name_ref, personal_all_infoConfirm.data.personalTitleRef.Value, personal_all_infoConfirm.data.phone_ref,
      //     personal_all_infoConfirm.data.street,
      //     new Date(personal_all_infoConfirm.data.birthday).toISOString().split('T')[0],
      //     new Date(personal_all_infoConfirm.data.expirationDate).toISOString().split('T')[0],
      //     new Date(personal_all_infoConfirm.data.issueDate).toISOString().split('T')[0],
      //     "Self-employed"
      // );
      // if (dataRegistrationReSubmit.data.Sys.Code === 1) {
      closeLoading();
      clearInterval(x);
      showCircularProgressbar(element, true);
      // }
    }, 500);
  });
};

function configUi(config) {
  disableEnterKey();
  let iHtml = "";
  if (config.logo) iHtml += "<div class='voolo-logo'></div>";
  if (config.intro)
    iHtml += `
    <div class="paragraph-text text-center margin-bottom-default" >
      ${lang.configUi.slogan}
        </div>
    <div class='voolo-intro'>
      <div class='sub4 sub3-mobile'>${lang.configUi.voolo_intro}</div>
      ${lang.configUi.sub_voolo_intro}
    </div>`;
  $(config.element + " form").prepend(iHtml);
};

let totalBillNumber = 0;
function listProductions(config) {
  disableEnterKey();
  //show list items
  let list = "";
  let lItems = "";
  let sTotal = "";
  let total = 0;
  if (config.dataItems != null) {
    config.dataItems.forEach((e) => {
      list +=
        `<div class='list'>
            <div class='image'><img src='` + e.imgUrl + `'/></div>
            <div class='info'>
              <p class='compact ellipsis'>` + e.product + `</p>
              <p class='text-space-gray'>` + e.descript + `</p>
              <p class='text-space-black'>` + e.quantity + `</p>
            </div>
            <div class='price compact'>` + e.priceShow + `</div>
        </div> `;
      total += parseInt(e.price);
    });
    sTotal = total.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

    //set total local
    billTotal = sTotal;
    totalBillNumber = total;
  }
  lItems +=
    `<div class='list-items'>
    <div class='card'>
      <div class='card-head'><span class='sub4 sub4-mobile'>${lang.listProductions.order_info}</span></div>
      <div class='card-body'>
        ${list}
        <div class='area-cost'>
          <div class='item tag' style=''>
            ${lang.listProductions.add_promotion}
          </div>
        </div>
        <div class='area-cost quote'>
          <div class='item' style='margin-bottom: 14px;'>
            <span class='pTitle'>${lang.listProductions.amount}</span>
            <span class='pPrice compact-16'>${sTotal}</span>
          </div>
          <div class='item'>
            <span class='pTitle'>${lang.listProductions.delivery_fee}</span>
            <span class='pPrice compact-16'>0 đ</span>
          </div>
        </div>
      </div>
      <div class='card-footer'>
        <span>${lang.listProductions.total_amount}</span>
        <span class='total-price'>` + sTotal + `</span>
      </div>
    </div>
    </div> `;
  if (config.items) $(config.element).prepend(lItems);
  let totalBill = document.querySelector(".total-price").textContent.replace("₫", "").replace(/\./g, "").trim();
  sessionStorage.setItem("totalBill", Number(totalBill));
};

function showCapture(base64, eId) {
  disableEnterKey();
  if (base64) {
    $("#" + eId).addClass("showImage");
    $("#" + eId).css({ background: "url(" + base64 + ") no-repeat center", "background-size": "cover", });
    if (eId !== null && eId !== "" && eId !== undefined) {
      if (eId === "btnCaptureFront") {
        btnFrontActive = true;
      }
      if (eId === "btnCaptureBack") {
        btnBackActive = true;
      }
      if (btnFrontActive && btnBackActive) {
        $("#btnSubmit").attr("disabled", false);
      } else {
        $("#btnSubmit").attr("disabled", true);
      }

      if (eId === "callHP") {
        btnSelActive = true;
        if (btnSelActive === true) {
          $("#btnSubmitNid").attr("disabled", false);
        } else {
          $("#btnSubmitNid").attr("disabled", true);
        }
      }
    } else {
      $("body").addClass("popup");
    }
  } else {
    $("body").addClass("popup");
  }
};

function forgotPinPhone(element, phone) {
  disableEnterKey();
  let html = `<form id = 'formValuePhone' class='formValue forgotPinPhone'>
    <div class='mobile'>
      <div class='form__row m-top-16'>
        <h4 style="margin-bottom:40px">${lang.forgotPinPhone.phone_number}</h4>
        <label for='phone_reset'>${lang.forgotPinPhone.input_phone_null}</label>
        <input autocomplete="off" type='number' id='phone_reset' class='form__input input-global' value="${phone ? phone : ""}" />
        <span class='error_message'></span>
      </div>
      <button type='button' id='btnContinue' class='payment-button'>${lang.showUICheckPhone.button_next}</button>
    </div>
    </form>`;
  $(element).html(html);

  //custom show
  configUi({
    element: element,
    logo: true,
    intro: false,
  });

  let dataPhone = document.querySelector("#phone_reset");
  let btnContinue = document.querySelector("#btnContinue");

  let phone_reset = $("#phone_reset").val().trim();
  if (phone_reset === null || phone_reset === "") {
    $("#phone_reset").prop("disabled", false);
  } else {
    $("#phone_reset").prop("disabled", true);
  }

  $("#phone_reset").on("input", function () {
    dataPhone.value = dataPhone.value.slice(0, 10);
    let isPhoneErr = !regexPhone.test(dataPhone.value);

    if (dataPhone.value !== null && dataPhone.value !== "") {
      if (!isPhoneErr) {
        btnContinue.disabled = false;
        formatStyleCorrectInput(dataPhone, errorMessage);
      } else {
        btnContinue.disabled = true;
        formatStyleWrongInput(dataPhone, errorMessage, lang.forgotPinPhone.error_phone);
      }
    } else {
      btnContinue.disabled = true;
      formatStyleWrongInput(dataPhone, errorMessage, lang.forgotPinPhone.input_phone);
    }
  });

  $("#btnContinue").click(function () {
    sessionStorage.setItem("phone_reset", phone_reset);
    forgotPinNid(element);
  });
};

function forgotPinNid(element) {
  disableEnterKey();
  let html = `<form class='formValue forgotPinPhone'>
    <div class='mobile'>
      <div class='form__row m-top-16'>
        <h4 style="margin-bottom:40px">${lang.showDataInform.nid}</h4>
        <label for='nid_reset'>${lang.forgotPinNid.input_nid_null}</label>
        <input autocomplete="off" type='number' id='nid_reset' class='form__input input-global' />
        <span class='error_message'></span>
      </div>
      <button type='button' id='btnSendOtp' class='payment-button'>${lang.showUICheckPhone.button_next}</button>
    </div>
              </form> `;
  $(element).html(html);

  //custom show
  configUi({
    element: element,
    logo: true,
    intro: false,
  });

  let dataNid = document.querySelector("#nid_reset");
  let errorMessage = document.querySelector(".error_message");
  let btnSendOtp = document.querySelector("#btnSendOtp");
  btnSendOtp.disabled = true;

  $("#nid_reset").on("keypress", function (e) {
    if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD") {
      e.preventDefault();
      return false;
    }
  });

  $("#nid_reset").on("focus", function () {
    formatStyleFocus(dataNid);
  });

  $("#nid_reset").on("input", function () {
    if (dataNid.value !== null && dataNid.value !== "") {
      dataNid.value = dataNid.value.slice(0, 12);
      let isNidErr = !regexNid.test(dataNid.value);
      if (!isNidErr) {
        formatStyleCorrectInput(dataNid, errorMessage);
        btnSendOtp.disabled = false;
      } else {
        formatStyleWrongInput(dataNid, errorMessage, lang.forgotPinNid.error_nid);
        btnSendOtp.disabled = true;
      }

      if (checkAllDataSame(dataNid.value)) {
        btnSendOtp.disabled = true;
        formatStyleWrongInput(dataNid, errorMessage, lang.forgotPinNid.error_nid);
      }
    } else {
      formatStyleWrongInput(dataNid, errorMessage, lang.forgotPinNid.input_nid);
      btnSendOtp.disabled = true;
    }
  });

  $("#btnSendOtp").click(function () {
    sessionStorage.setItem("nid_reset", $("#nid_reset").val().trim());
    let phone_reset = sessionStorage.getItem("phone_reset");
    let nid_reset = sessionStorage.getItem("nid_reset");
    let data = sendOtpPin(phone_reset, nid_reset);
    if (data.status === true) {
      showFormVerifyOTP(element, phone_reset, data.otp);
    } else if (data.status === false && data.message === "Send otp failure") {
      formatStyleWrongInput(dataNid, errorMessage, lang.forgotPinNid.error_OTP);
      btnSendOtp.disabled = true;
    } else if (data.status === false && data.statusCode === 1002) {
      formatStyleWrongInput(dataNid, errorMessage, lang.forgotPinNid.error_acc);
      btnSendOtp.disabled = true;
    } else if (data.status === false && data.statusCode === 1001) {
      formatStyleWrongInput(dataNid, errorMessage, lang.forgotPinNid.error_nid_retype);
      btnSendOtp.disabled = true;
    } else if (data.status === false && data.statusCode === 8000) {
      formatStyleWrongInput(dataNid, errorMessage, lang.forgotPinNid.error_nid);
      btnSendOtp.disabled = true;
    }
  });
};

function showFormPincode(element, phone, screen) {
  disableEnterKey();

  let html = `<div class='box form-card-pincode'>
                    <div class='voolo-logo'></div>
                    <form id='formSetupPinCode' class="box-mobile m-top-16">
                            <div class='${screen}'>
                                <div class='text-center form-pincode'>
                                    <h4>${lang.showFormPincode.pin_input}</h4>
                                    <p class=''>${lang.showFormPincode.pin_verify_info}</p>
                                    <div class='sub4'>${lang.showFormPincode.pin}</div>
                                    <div id='pincode'></div>
                                    <span class='error_message error_message_pin'></span>
                                </div>
                            </div>
                            <button type='button' id='btnSubmitPin' class='payment-button medium'>${lang.showUICheckPhone.button_next}</button>
                            <p style='text-align: center;' class='txt-note'>${lang.showFormPincode.forgot_pin}<a class="ahref" onclick='forgotPinPhone("${element}","${phone}")' style='width:auto'>${lang.showFormPincode.click}</a></p>
                    </form>
                </div> `;

  $(element).html(html);

  $(window).scrollTop(0);

  let btnSubmitPin = document.querySelector("#btnSubmitPin");
  btnSubmitPin.disabled = true;


  new PincodeInput("#pincode", {
    count: 4,
    secure: true,
    pattern: "[0-9]*",
    previewDuration: -1,
    inputId: "pin",
    onInput: (value) => {
      if (value.length === 4) {
        $("#pincode").css({ border: 'none' });
        $("#pincode").removeClass("error_pincode_red");
        btnSubmitPin.disabled = false;
      } else if (value.length === 0) {
        formatStyleWrongInput(pincode, errorMessage, lang.showFormPincode.error_input_pin);
        $("#pincode").css({ border: 'none' });
        $("#pincode").removeClass("error_pincode_red");
        btnSubmitPin.disabled = true;
      } else {
        $("#pincode").css({ border: 'none' });
        $("#pincode").removeClass("error_pincode_red");
        btnSubmitPin.disabled = true;
      }
      $("#pincode").removeClass("error_pincode_red");
      $(".error_message_pin").css({ visibility: "hidden", opacity: 0 });
    },
  });

  $("#pin1").focus();

  $("#pincode").on("keypress", function (e) {
    if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD" || e.key === "Tab" || e.keyCode === 9 || e.which === 9 || e.code === "Tab") {
      e.preventDefault();
      return false;
    }
  });

  $("#pincode").on("keydown", function (e) {
    if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD" || e.key === "Tab" || e.keyCode === 9 || e.which === 9 || e.code === "Tab") {
      e.preventDefault();
      return false;
    }
  });

  let pincode = document.querySelector("#pincode");
  let errorMessage = document.querySelector(".error_message");

  $("#btnSubmitPin").click(function () {
    let pin =
      $("#pin1").val().trim() +
      $("#pin2").val().trim() +
      $("#pin3").val().trim() +
      $("#pin4").val().trim();
    let result = login(phone, pin);
    if (result.dataVOOLO?.status === true && result.dataVOOLO?.step === 4) {
      showLoading();
      let token = result?.dataVOOLO?.accessToken;
      sessionStorage.setItem("token", btoa(token));
      let x = setTimeout(() => {
        closeLoading();
        clearInterval(x);
        switch (screen) {
          case "VERIFY_PIN":
            let qrcode = sessionStorage.getItem('qrcode');
            if (qrcode) {
              showFormPaytmentBill(element);
            }
            else {
              showAllTenor(element);
            }
            break;
          case "SHOW_SUCCESS_PAGE":
            messageScreen(element, { screen: "pincode_success", pipeline: false, });
            break;
          case "BUY_SUCCESS":
            let SessionIDCheckAccountInfo = sessionStorage.getItem('SessionIDCheckAccountInfo').toString();
            let AccountNumberCheckAccountInfo = sessionStorage.getItem('AccountNumberCheckAccountInfo').toString();
            let data = postTransaction(SessionIDCheckAccountInfo, AccountNumberCheckAccountInfo);
            if (data.data.Sys.Code === 1) {
              messageScreen(element, { screen: "buy_success", pipeline: false });
            }
            else if (data.status === false) {
              messageScreen(element, { screen: "buy_unsuccess", pipeline: false, });
            }
            break;
          case "BUY_UNSUCCESS":
            messageScreen(element, { screen: "buy_unsuccess", pipeline: false, });
            break;
        }
      }, 300);
    }
    if (result.dataVOOLO?.status === true && result.dataVOOLO?.step === 2) {
      showLoading();
      let token = result?.dataVOOLO?.accessToken;
      sessionStorage.setItem("token", btoa(token));
      let x = setTimeout(() => {
        closeLoading();
        clearInterval(x);
        let personal = getDetail(phone, token);
        if (personal) {
          showReviewDataInform(element, personal);
        }
      }, 300);
    } else if (result?.status === false && result?.statusCode === 1002) {
      formatStyleWrongPincode(pincode, errorMessage, lang.showFormPincode.error_phone);
      btnSubmitPin.disabled = true;
    } else if (result?.status === false && result?.statusCode === 1003) {
      if (result?.countFail !== 5) {
        formatStyleWrongPincode(pincode, errorMessage, lang.showFormPincode.error_incorrect_pin + "(" + result?.countFail + "/5)");
        addBorderStyle("pin", "RED");
        btnSubmitPin.disabled = true;
      } else {
        formatStyleWrongPincode(pincode, errorMessage, lang.showFormPincode.error_incorrect_pin_5);
        addBorderStyle("pin", "RED");
        for (i = 1; i <= 4; i++) {
          $("#pin" + i).attr("disabled", true);
        }
        btnSubmitPin.disabled = true;
      }
    } else if (result?.status === false && result?.statusCode === 1004) {
      formatStyleWrongPincode(pincode, errorMessage, lang.showFormPincode.error_incorrect_pin_5);
      addBorderStyle("pin", "RED");
      for (i = 1; i <= 4; i++) {
        $("#pin" + i).attr("disabled", true);
      }
      btnSubmitPin.disabled = true;
    }
  });
};

function showFormSetupPin(element, screen, token) {
  disableEnterKey();
  let html = `<div class='form-card showFormSetupPin ${screen}'>
    <form id='formSetupPinCode'>
      ${screen === "SHOW_RESET_PIN" ? "<div class='voolo-logo'></div>" : ""}
      <div class=''>
        <div class='no-line'></div>
        <div class='text-center form-pincode m-top-16'>
          <h4 class='form-showdata-title'>${screen === "SHOW_RESET_PIN" ? lang.showFormSetupPin.setup_pin : lang.showFormSetupPin.setup_pin}</h4>
          <p class='sub4'>${lang.showFormPincode.pin}</p>
          <div id='pincode'></div>
          <p class='sub4'>${lang.showFormSetupPin.retype_pin}</p>
          <div id='repincode'></div>
          <span class='error_message error_message_pin'></span>
        </div>
      </div>
      <button type='button' id='btnSubmitPin' class='payment-button medium'>${lang.showUICheckPhone.button_next}</button>
    </form>
              </div> `;
  $(element).css("display", "grid");
  $(element).html(html);
  if (screen !== "" && screen === "SHOW_LOGIN") {
    showProcessPipeline(2, true);
  }

  pageTitle(element, '<h4 class="pageTitle">' + lang.showFormSetupPin.setup_pin + "</h4>", "non-pageTitle");
  $(window).scrollTop(0);

  let iPut1, iPut2 = false;
  $("#btnSubmitPin").attr("disabled", true);

  new PincodeInput("#pincode", {
    count: 4,
    secure: true,
    pattern: "[0-9]*",
    previewDuration: -1,
    inputId: "pin",
    onInput: (value) => {
      if (value.length == 4) {
        iPut1 = true;
        if (iPut1 && iPut2) {
          $("#btnSubmitPin").attr("disabled", false);
        } else {
          $("#btnSubmitPin").attr("disabled", true);
        }
      } else {
        iPut1 = false;
        $("#btnSubmitPin").attr("disabled", true);
      }
      $(".pincode-input").removeClass("error_pincode_red");
      $(".error_message_pin").css({ visibility: "hidden", opacity: 0 });
    },
  });

  $("#pin1").focus();

  new PincodeInput("#repincode", {
    count: 4,
    secure: true,
    pattern: "[0-9]*",
    previewDuration: -1,
    inputId: "pincf",
    onInput: (value) => {
      if (value.length == 4) {
        iPut2 = true;
        if (iPut1 && iPut2) {
          $("#btnSubmitPin").attr("disabled", false);
        } else {
          $("#btnSubmitPin").attr("disabled", true);
        }
      } else {
        iPut2 = false;
        $("#btnSubmitPin").attr("disabled", true);
      }
      $(".pincode-input").removeClass("error_pincode_red");
      $(".error_message_pin").css({ visibility: "hidden", opacity: 0 });
    },
  });

  $("#repincode").on("keypress", function (e) {
    if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD" || e.key === "Tab" || e.keyCode === 9 || e.which === 9 || e.code === "Tab") {
      e.preventDefault();
      return false;
    }
  });

  $("#repincode").on("keydown", function (e) {
    if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD" || e.key === "Tab" || e.keyCode === 9 || e.which === 9 || e.code === "Tab") {
      e.preventDefault();
      return false;
    }
  });

  $("#pincode").on("keypress", function (e) {
    if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD" || e.key === "Tab" || e.keyCode === 9 || e.which === 9 || e.code === "Tab") {
      e.preventDefault();
      return false;
    }
  });

  $("#pincode").on("keydown", function (e) {
    if (e.key === "e" || e.keyCode === 69 || e.which === 69 || e.code === "KeyE" || e.key === "d" || e.keyCode === 68 || e.which === 68 || e.code === "KeyD" || e.key === "Tab" || e.keyCode === 9 || e.which === 9 || e.code === "Tab") {
      e.preventDefault();
      return false;
    }
  });

  $("#btnSubmitPin").click(function () {
    let pin1 = $("#pin1").val().trim();
    let pin2 = $("#pin2").val().trim();
    let pin3 = $("#pin3").val().trim();
    let pin4 = $("#pin4").val().trim();

    let pincf1 = $("#pincf1").val().trim();
    let pincf2 = $("#pincf2").val().trim();
    let pincf3 = $("#pincf3").val().trim();
    let pincf4 = $("#pincf4").val().trim();

    let pin = pin1 + pin2 + pin3 + pin4;
    let pincf = pincf1 + pincf2 + pincf3 + pincf4;

    $("#btnSubmitPin").attr("disabled", true);
    if (pin === pincf && pin !== null && pincf !== null) {
      if (screen === "SHOW_LOGIN") {
        const data = JSON.parse(sessionStorage.getItem("personal_all_info"));
        const front_nid_image = sessionStorage.getItem("front-image");
        const back_nid_image = sessionStorage.getItem("back-image");
        const selfie_image = sessionStorage.getItem("selfie-image");
        let all_data_info = {
          ...data,
          pin: pin,
          nid_front_image: front_nid_image,
          nid_back_image: back_nid_image,
          selfie_image: selfie_image,
        };
        let result = addInfoPersonal(
          all_data_info.name,
          all_data_info.sex,
          all_data_info.birthday,
          all_data_info.phone,
          all_data_info.citizenId,
          all_data_info.issueDate,
          all_data_info.expirationDate,
          all_data_info.city,
          all_data_info.district,
          all_data_info.ward,
          all_data_info.street,
          all_data_info.temporaryCity,
          all_data_info.temporaryDistrict,
          all_data_info.temporaryWard,
          all_data_info.temporaryStreet,
          all_data_info.personal_title_ref,
          all_data_info.name_ref,
          all_data_info.phone_ref,
          all_data_info.pin
        );
        sessionStorage.setItem("pin", btoa(pin));
        if (result.status === true) {
          showLoading();
          let x = setTimeout(() => {
            showPopupMessage(`${lang.showFormSetupPin.notification_success} `, `${lang.showFormSetupPin.send_info} `, `${lang.showPopupMessage.button_ok} `);
            let phone = all_data_info.phone;
            let phone_ref = all_data_info.phone_ref;
            let docNameSelie = phone + "selfie" + getTypeOfImage(selfie_image);
            let docNameFront_Nid = phone + "frontnid" + getTypeOfImage(front_nid_image);
            let docNameBack_Nid = phone + "backnid" + getTypeOfImage(back_nid_image);
            let dataRegistration = registration(
              "",
              "",
              all_data_info.name,
              all_data_info.sex,
              all_data_info.birthday,
              all_data_info.citizenId,
              all_data_info.city,
              all_data_info.issueDate,
              phone,
              all_data_info.district,
              all_data_info.ward,
              all_data_info.street,
              all_data_info.temporaryCity,
              all_data_info.temporaryDistrict,
              all_data_info.temporaryWard,
              all_data_info.temporaryStreet,
              docNameSelie,
              selfie_image,
              docNameFront_Nid,
              front_nid_image,
              docNameBack_Nid,
              back_nid_image,
              all_data_info.name_ref,
              all_data_info.personal_title_ref,
              phone_ref,
              all_data_info.street,
              all_data_info.birthday,
              all_data_info.expirationDate,
              all_data_info.issueDate,
              "3"
            );
            if (dataRegistration.data.Sys.Code === 1) {
              close_popup();
              closeLoading();
              clearInterval(x);
              showCircularProgressbar(element, true);
            }
          }, 500);
        }
        else if (result.status === false && result.statusCode === 1000) {
          $("body .overlay-popup").remove();
          $("body .overlay").remove();
          showPopupMessage(lang.showFormSetupPin.notification_unsuccess, lang.showFormSetupPin.error_account_exists, lang.showPopupMessage.button_back_login);
        }
        else {
          $("body .overlay-popup").remove();
          $("body .overlay").remove();
          showPopupMessage(lang.showFormSetupPin.notification_unsuccess, lang.showFormSetupPin.error_send_info, lang.showPopupMessage.button_back);
        }
      } else if (screen === "SHOW_RESET_PIN") {
        let phone = sessionStorage.getItem("phone");
        let data = resetPin(phone, pin, token);
        close_popup();
        if (data.status === true) {
          messageScreen(element, { screen: "pincode_success", pipeline: false, });
        } else {
          messageScreen(element, { screen: "pincode_unsuccess", pipeline: false, });
        }
      }
    } else {
      let repincode = document.querySelector("#repincode");
      let errorMessage = document.querySelector(".error_message");
      formatStyleWrongPincode(repincode, errorMessage, lang.showFormSetupPin.pin_notmatch);
      addBorderStyle("setuppin", "RED");
      addBorderStyle("setupcfpin", "RED");
      $("body").removeClass("loading");
      iPut1, (iPut2 = false);
      $("#btnSubmitPin").attr("disabled", true);
    }
  });
};

function resendOTP(phone) {
  let inputs = document.querySelectorAll(".pincode-input");
  inputs.forEach((input) => (input.value = ""));
  let nid_reset = sessionStorage.getItem("nid_reset");
  let otp = sendOtpPin(phone, nid_reset);
  if (otp !== null) {
    resetTimer(true);
  }
  timer(60);
};

function showFormVerifyOTP(element, phone, otp) {
  disableEnterKey();
  // if ($(window).width() < 415) {
  //   alert(lang.resendOTP.OTP + otp);
  // }
  close_popup();
  let html = `<div class= "overlay-pincode card-otpcode" >
    <div class="alert-box">
      <span class='close'></span>
      <form id='formSetupPinCode'>
        <div class='card'>
          <div class='card-head no-line'></div>
          <div class='card-body text-center form-otpcode'>
            <h4>${lang.showFormVerifyOTP.input_OTP}</h4>
            <p class='compact-12'>${lang.showFormVerifyOTP.sent_OTP}<b>${phone.replaceAt(3, "****")}</b></p>
            <div id='otpcode'></div>
            <span class='error_message error_message_otp'></span>
          </div>
          <div class='card-footer' style="height:4px"></div>
        </div>
        <button type='button' id='btnSubmitVerifyOTP' class='payment-button'>${lang.showUICheckPhone.button_next}</button>
        <p style='text-align: center;' class='compact-12'>${lang.showFormVerifyOTP.OTP_not_receive}  <a class="ahref" id="sendOtpAgain" onclick='resendOTP("${phone}")' style='width:auto'>${lang.showFormVerifyOTP.resend_OTP}(<c id="timer"></c>)</a></p>
      </form>
    </div>
    </div> `;
  $(element).append(html);
  $("body").addClass("pinalert");
  timer(60);
  resetTimer(true);

  let btnSubmitVerifyOTP = document.querySelector("#btnSubmitVerifyOTP");
  btnSubmitVerifyOTP.disabled = true;

  let errorMessage = document.querySelector(".alert-box .error_message");

  new PincodeInput("#otpcode", {
    count: 6,
    secure: false,
    pattern: "[0-9]*",
    previewDuration: 100,
    inputId: "otp",
    onInput: (value) => {
      if (value.length === 6) {
        btnSubmitVerifyOTP.disabled = false;
      } else {
        $(".pincode-input").removeClass("error_otpcode_red");
        btnSubmitVerifyOTP.disabled = true;
      }
    },
  });

  let otps = document.querySelectorAll("#otpcode");

  $("#otpcode").on("keypress", function (e) {
    if (e.key === "e" || e.keyCode === 69) {
      e.preventDefault();
      return false;
    }
  });

  $("#otpcode").on("keydown", function (e) {
    if (e.key === "e" || e.keyCode === 69) {
      e.preventDefault();
      return false;
    }
  });

  $("span.close").click(function () {
    $("body .overlay-pincode").remove();
    $("body").removeClass("pinalert");
  });

  $("#btnSubmitVerifyOTP").click(function () {
    let otp1 = $("#otp1").val().trim();
    let otp2 = $("#otp2").val().trim();
    let otp3 = $("#otp3").val().trim();
    let otp4 = $("#otp4").val().trim();
    let otp5 = $("#otp5").val().trim();
    let otp6 = $("#otp6").val().trim();
    let otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    if (phone !== null && otp !== null) {
      let phone_reset = sessionStorage.getItem("phone_reset");
      let nid_reset = sessionStorage.getItem("nid_reset");
      const data = verifyOtpPin(phone_reset, nid_reset, otp);
      if (data.status === true && data.token !== null) {
        close_popup();
        $("body").removeClass("pinalert");
        showFormSetupPin(element, "SHOW_RESET_PIN", data.token);
      } else if (data.status === false && data.statusCode === 4000) {
        if (data?.countFail !== 5) {
          formatWrongOTP(errorMessage, lang.showFormVerifyOTP.error_incorrect_OTP + "(" + data?.countFail + "/5)");
          addBorderStyle("otp", "RED");
          btnSubmitVerifyOTP.disabled = true;
        }
      } else if (data.status === false && data.statusCode === 3000) {
        formatWrongOTP(errorMessage, lang.showFormVerifyOTP.error_expired_OTP);
        addBorderStyle("otp", "RED");
        btnSubmitVerifyOTP.disabled = true;
      } else if (data.status === false && data.statusCode === 1008) {
        formatWrongOTP(errorMessage, lang.showFormVerifyOTP.error_incorrect_OTP_5);
        addBorderStyle("otp", "RED");
        for (i = 1; i <= 6; i++) {
          $("#otp" + i).attr("disabled", true);
        }
        btnSubmitVerifyOTP.disabled = true;
      }
    }
  });
};

function showContract(element, phone, isFaceAuth = null) {
  disableEnterKey();
  setRoute("showContract");
  let dataIframe;
  if (isFaceAuth != null) {
    dataIframe = getIFrame(phone, true);
  }
  else {
    dataIframe = getIFrame(phone, false);
  }
  if (dataIframe.code === 1 && dataIframe.progress === 'success' && dataIframe.esign_url) {
    let ifrm = "";
    ifrm = document.createElement("iframe");
    ifrm.setAttribute("id", "eSign");
    ifrm.setAttribute("allow", "autoplay; camera; microphone");
    ifrm.setAttribute("src", dataIframe.esign_url);
    ifrm.setAttribute("class", "contract-frame");
    $(element).html(ifrm);
    window.addEventListener("message", async ({ data, source }) => {
      if (data.step === "ESIGN_COMPLETE") {
        ifrm.remove();
        let phone = sessionStorage.getItem("phone");
        await updateStep(phone, 3);
        showCircularProgressbar(element, false);
      } else if (data.step === "FACE_AUTH") {
        ifrm.remove();
        messageScreen(element, { screen: "unsuccessScreen", pipeline: false });
      } else if (data.step === "OTP_VALIDATION") {
        ifrm.remove();
        messageScreen(element, { screen: "unsuccessScreen", pipeline: false });
      }
    });
  }
};

async function customerInfo(element) {
  disableEnterKey();
  let phone = sessionStorage.getItem("phone");
  let token = atob(sessionStorage.getItem("token"));
  let infoCustomer = getDetail(phone, token);
  let accountNumber = infoCustomer?.data?.dataFEC?.dataFEC?.AccountNo;
  let totalAmount = 150000;

  let isCheckAccountInfo = await checkAccountInfo(accountNumber, totalAmount);
  let isActiveAccount = isCheckAccountInfo?.data?.AccountInfo;
  let otb = isActiveAccount?.OTB;

  let strStatus = ``;
  if (otb >= totalAmount) {
    strStatus = `
    <div class='ico-success'></div>
      <b>${lang.customerInfo.congatulation}</b>
  `;
  } else if (otb < totalAmount) {
    strStatus = `
    <div class='ico-unsuccess'></div>
      <b>${lang.customerInfo.unfortunately}</b>
  `;
  }

  if (!isActiveAccount) {
    strStatus = `
    <div class='ico-unsuccess'></div>
      <b>${lang.customerInfo.unactive_account}</b>
  `;
  }

  let str = `<div class="customer" >
                    <div class='voolo-logo'></div>
                    <div id="customerInfo">
                        <div class="avatar"><img src="" /></div>
                        <div class='detail'>
                            <h3 style="font-weight:700;font-size:20px;">${infoCustomer.data.name}<c>${lang.customerInfo.yeah}</c></h3>
                            ${isActiveAccount ? `<p class='limit-text'>${lang.customerInfo.limit_credit}<span class='limit-number'>${formatCurrency(otb * 1).replace("₫", "đ")}</span></p>` : ""} 
                            ${strStatus}
                        </div>
                    </div>
              </div> `;

  if ($(window).width() < 700) {
    $(element).prepend(str);
    $(element).find(".avatar").css("display", "none");
    $(element).find(".list-items").css("margin-top", "212px");
    $(element)
      .find(".detail h3")
      .css({ "font-weight": "600", "font-size": "18px" });
  } else {
    $(element).prepend(str);
    $(element)
      .find(".list-items")
      .css({ "margin-top": "410.5px", "padding-top": "0" });
    $(element).find(".formValue").css("margin-top", "410.5px");
    $(element).find(".avatar").css("display", "none");
    $(element)
      .find(".detail h3")
      .css({ "font-weight": "700", "font-size": "20px" });
  }
};

function showProcessPipeline(step, logo = false, formName = "") {
  let s1, s2, s3, s4, s5 = "";
  switch (step) {
    default:
    case 1:
      s1 = "active";
      break;
    case 2:
      s1 = s2 = "active";
      break;
    case 3:
      s1 = s2 = s3 = "active";
      break;
    case 4:
      s1 = s2 = s3 = s4 = "active";
      break;
    case 5:
      s5 = s1 = s2 = s3 = s4 = "active";
      break;
  }
  let pipeline = `
    <div class='headrow'>
      ${logo ? '<div class="voolo-logo"></div>' : ""}
                        <div class='sub2'>${lang.showProcessPipeline.pay_first_buy_later}</div>
                        <div class='line'>
                            <span class='Tpipe ${step !== 1 ? s1 : ""}'></span>
                            <span class='Tpipe ${s3}'></span>
                            <span class='Tpipe ${s4}'></span>
                            <span class='Tpipe ${s5}'></span>
                            <span class='Tpipe last'></span>
                        </div>
                        <div class='pipeline'>
                            <span class='pipe ${s1}'><span class='label-span'>${lang.showProcessPipeline.cus_info}</span></span>
                            <span class='pipe ${s2}'><span class='label-span'>${lang.showProcessPipeline.setup_pin}</span></span>
                            <span class='pipe ${s3}'><span class='label-span'>${lang.showProcessPipeline.sign_onl}</span></span>
                            <span class='pipe ${s4}'><span class='label-span'>${lang.showProcessPipeline.verify_info}</span></span>
                            <span class='pipe ${s5}'><span class='label-span'>${lang.showProcessPipeline.complete}</span></span>
                        </div>
                </div> `;

  $("#voolo").prepend(pipeline);
  if (formName !== "") $("#voolo").addClass(formName);
  $(".formValue").addClass("formValue-mt");
  $(".form-card").addClass("formValue-mt");
  $(".box").addClass("formValue-mt");
};

function setRoute(func) {
  history.pushState({}, "Voolo Set Url", "#" + func);
};

function router(element) {
  let phone = sessionStorage.getItem("phone");
  let url = window.location.href;
  let base_url = window.location.origin;
  let host = window.location.host;
  let path = window.location.pathname;
  route = url.split("#")[1];
  let sessionId = null;
  if (route && route.includes('?')) {
    sessionId = route.split('?')[1];
    route = route.split('?')[0];
    if (sessionId.startsWith('sessionId')) {
      sessionId = sessionId.split('=')[1];
    }
  }

  switch (route) {
    default:
      sessionStorage.setItem("lang", "vi");
      showUICheckPhone(element);
    case undefined:
      showUICheckPhone(element);
      break;
    case "showUiCheckStep":
      showUiCheckStep(sessionId, element);
      break;
    case "showUICheckPhone":
      showUICheckPhone(element);
      break;
    case "showUICheckNid":
      showUICheckNid(element);
      break;
    case "captureNidFrontAndBack":
      captureNidFrontAndBack(element);
      break;
    case "showDataInform":
      showDataInform(element);
      break;
    case "showContract":
      showContract(element, phone);
      break;
    case "showAllTenor":
      showAllTenor(element);
      break;
    case "en":
      sessionStorage.setItem("lang", "en");
      location.href = DOMAIN;
      break;
    case "vi":
      sessionStorage.setItem("lang", "vi");
      location.href = DOMAIN;
      break;
  }
};

function messageScreen(element, config) {
  if (config.screen == "successScreen") {
    html = `<div class='box showMessage box-mobile formValue-mt-315'>
    <div class='paragraph-text text-center margin-bottom-default'>
      <div class='ico-success ico-150'></div>
      <h3>${lang.messageScreen.registered_success}</h3>
      <p style='text-align: center;' class='text-message'>
        ${lang.messageScreen.callback}
      </p>
    </div>
            </div> `;
  }

  if (config.screen == "unsuccessScreen") {
    html = `<div class='box showMessage box-mobile formValue-mt-315'>
    <div class='paragraph-text text-center margin-bottom-default'>
      <div class='ico-unsuccess ico-150'></div>
      <h3>${lang.messageScreen.registered_unsuccess}</h3>
      <p style='text-align: center;' class='text-message'>
        ${lang.messageScreen.callback}
      </p>
    </div>
            </div> `;
  }

  if (config.screen == "timeoutSession") {
    html = `<div class='box showMessage box-mobile formValue-mt-315' style="margin: auto !important">
    <div class='paragraph-text text-center margin-bottom-default'>
      <div class='ico-unsuccess ico-150'></div>
      <h3>Session Timeout</h3>
      <p style='text-align: center;' class='text-message'>
        ${lang.messageScreen.callback}
      </p>
    </div>
            </div> `;
  }

  if (config.screen == "pincode_unsuccess") {
    html = `<div class='box showMessage box-mobile'>
    <div class='paragraph-text text-center margin-bottom-default'>
      <div class='ico-unsuccess ico-150'></div>
      <h3>${lang.messageScreen.update_fail_pin}</h3>
      <p>${lang.messageScreen.call_switchboard}</p>
      <button class='payment-button' id="tryagain">${lang.messageScreen.button_retry}</button>
    </div>
            </div> `;
  }

  if (config.screen == "pincode_success") {
    html = `<div class='box showMessage box-mobile'>
    <div class='paragraph-text text-center margin-bottom-default'>
      <div class='ico-success ico-150'></div>
      <h3>${lang.messageScreen.update_success_pin}</h3>
      <p style='text-align: center;'>
        ${lang.messageScreen.callback}
      </p>
    </div>
            </div> `;
  }

  if (config.screen == "buy_success") {
    html = `<div class='box box-mobile showMessage ${config.screen}'>
    <div class='paragraph-text text-center margin-bottom-default'>
      <div class='ico-success ico-150'></div>
      <h3>${lang.messageScreen.buy_success}</h3>
      <p style='text-align: center;'>
        ${lang.messageScreen.callback}
      </p>
    </div>
            </div> `;
  }

  if (config.screen == "buy_unsuccess") {
    html = `<div class='box box-mobile showMessage'>
    <div class='paragraph-text text-center margin-bottom-default'>
      <div class='ico-unsuccess ico-150'></div>
      <h3>${lang.messageScreen.buy_fail}</h3>
      <p>${lang.messageScreen.call_switchboard}</p>
      <button class='payment-button' id="tryagain">${lang.messageScreen.button_retry}</button>
    </div>
            </div> `;
  }

  $(element).removeClass("non-flex");
  $(element).html(html);
  if (config.pipeline) showProcessPipeline(5, true);
  let n = 5;
  let cInterval = setInterval(function () {
    $(".coutdown").html(n);
    if (n === 0) {
      if (config.screen == "successScreen") {
        showAllTenor(element);
      }
      if (config.screen == "buy_success" || config.screen == "buy_unsuccess" || config.screen == "successScreen" || config.screen == "unsuccessScreen" || config.screen == "pincode_success" || config.screen == "pincode_unsuccess") {
        window.location.href = DOMAIN;
      }
      clearTimeout(cInterval);
    }
    n = n - 1;
  }, 1000);

  $("#tryagain").click(function (e) {
    location.href = DOMAIN;
  });
};

String.prototype.replaceAt = function (index, replacement) {
  return (this.substring(0, index) + replacement + this.substring(index + replacement.length));
};

$(function () {
  $("p.txt-pleasewait").html(lang.indexhtml.waiting);
});

function changeColor(id) {
  let dataElement = document.querySelector(id);
  let type = dataElement.type;
  let value = dataElement.value;
  if (type === "text" || type === "number" || type === "date") return;
  if (value) {
    dataElement.classList.remove("default-gray");
  } else {
    dataElement.classList.add("default-gray");
  }
};

function showFormPaytmentBill(element) {
  disableEnterKey();
  let html = `<div class='box form-card-pincode'>
              <div class='voolo-logo'></div>
              <form id='formPaymentBill' class="box-mobile m-top-16">
                  <div>
                      <div class='text-center form-pincode'>
                          <h4>Số tiền thanh toán & Mã hóa đơn</h4>
                          <label class="sub3" for='total_bill'>Số tiền thanh toán</label>
                          <input type="number" name="total_bill" id="total_bill"/>
                          <span style='text-align: center' class='error_message error_message_total_bill'></span>
                          <label class="sub3" for='code_bill'>Mã hóa đơn</label>
                          <input type="number" name="code_bill" id="code_bill"/>
                          <span style='text-align: center' class='error_message error_message_code_bill'></span>
                      </div>
                  </div>
                  <button type='button' id='btnSubmitPayment' class='payment-button medium sub3'>Tiếp tục</button>
              </form>
              </div> `;
  $(element).html(html);

  let btnSubmitPayment = document.querySelector('#btnSubmitPayment');
  btnSubmitPayment.disabled = true;

  let total_bill = document.querySelector('#total_bill');
  let code_bill = document.querySelector('#code_bill');

  let total_bill_value = '';

  let errorMessageTotalBill = document.querySelector(".error_message_total_bill");
  let errorMessageCodeBill = document.querySelector(".error_message_code_bill");


  $("#total_bill").on("keypress", function (e) {
    disabledE_disabledD(e);
  });

  $("#code_bill").on("keypress", function (e) {
    disabledE_disabledD(e);
  });

  $("#total_bill").on("focus", function () {
    formatStyleCorrectInput(total_bill, errorMessageTotalBill);
    formatStyleFocus(total_bill);
  });

  $("#code_bill").on("focus", function () {
    formatStyleCorrectInput(total_bill, errorMessageCodeBill);
    formatStyleFocus(total_bill);
  });

  $('#total_bill').on('input', function () {
    total_bill_value = $('#total_bill').val().trim();

    if (total_bill_value > 0) {
      if (total_bill_value > 1000000) {
        formatStyleWrongInput(total_bill, errorMessageTotalBill, 'Số tiền thanh toán quá lớn');
        btnSubmitPayment.disabled = true;
      }
      else {
        formatStyleCorrectInput(total_bill, errorMessageTotalBill);
        btnSubmitPayment.disabled = false;
      }
    }
    else if (!total_bill_value) {
      formatStyleWrongInput(total_bill, errorMessageTotalBill, 'Vui lòng nhập số tiền thanh toán');
      btnSubmitPayment.disabled = true;
    }
  });

  $("#btnSubmitPayment").click(function () {
    showLoading();
    let x = setTimeout(async () => {
      closeLoading_clearInterval(x);
      let data = await addBillingInfo("NjMzZThmOTVmOTY4MDAwMDgyMDA0N2Q1LjIwMjItMTAtMTEgMDg6NTM6NTE=", sessionStorage.getItem('phone'), "626772e340e111b41fa31897", "", total_bill_value, "b1dbf85e-f084-497a-8ad5-67d5d99c6b77");
      if (data.status === true && data.data) {
        showAllTenor(element);
      }
    }, 300);
  });
};

function replaceData(data) {
  if (data) {
    const arrNid = data.toString().split('');
    let strNid = '';
    for (let itemNid of arrNid) {
      if (strNid.length < arrNid.length - 4) {
        strNid += itemNid;
      } else {
        arrNid.splice(0, arrNid.length - 4);
        break;
      }
    }
    let resultNid = '';
    if (data.length === 12) {
      resultNid = '********' + arrNid.join('');
    } else if (data.length === 9) {
      resultNid = '*****' + arrNid.join('');
    }
    return resultNid;
  }
};

function showUiCheckStep(sessionId, element) {
  setRoute("showUiCheckStep");
  sessionStorage.setItem('sessionId', sessionId);

  let sessiondecode = atob(sessionId);

  let splitSession = sessiondecode.split("&");

  let timeSession = splitSession[0];

  let partnerId = splitSession[1].split("=")[1];

  let phoneSession = splitSession[2].split("=")[1];

  let timeNow = new Date(Date.now()).getTime();

  if (timeNow > timeSession) {
    messageScreen(element, { screen: "timeoutSession", pipeline: false });
  }
  else {
    sessionStorage.setItem("phone", phoneSession);
    let result = checkPhoneExists(phoneSession);
    if (result.statusCode === 1000 && result.status === true) {
      let step = result.data.step;
      if (result?.dataFEC?.Business_Status === 'REGISTRATION_FAILED') {
        messageScreen(element, { screen: "unsuccessScreen", pipeline: true });
        return;
      }
      if (step === 4) {
        showAllProvider(element, "REGISTERED_PHONE");
      }
      if (step === 3) {
        showCircularProgressbar(element, false);
      } else if (step === 2) {
        showAllProvider(element, "REGISTERED_PHONE");
      } else if (step === 0) {
        messageScreen(element, { screen: "unsuccessScreen", pipeline: false, });
        return;
      }
    } else if (result.statusCode === 1003 && result.status === false) {
      showUICheckNid(element);
    } else if (result.statusCode === 3001 && result.status === false) {

    } else if (result.statusCode === 3002 && result.status === false) {
      showUICheckNid(element);
    }
  }
};
