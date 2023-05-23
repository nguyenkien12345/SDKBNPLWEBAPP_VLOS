function showUseGuideSelfy() {
    $('body').find('.guideslide').remove();
    $("#formValueNid").hide();
    $('#voolo').append("<div class='guideslide'></div>");
    $('.guideslide').load('useguide.html', function () {
        //update language
        $(".slide-title").html(lang.useguidehtml.guide_capture_selfie);
        $(".image-container .slide .desc span.none").html(lang.useguidehtml.none);
        $(".image-container .slide .desc span.done").html(lang.useguidehtml.good);
        $(".image-container .slide .desc span.sub-title-1").html(lang.useguidehtml.pls_selfie_rules);
        $(".image-container .slide .desc span.sub-title-2").html(lang.useguidehtml.pls_choose_place);
        $(".image-container .slide .desc span.sub-title-3").html(lang.useguidehtml.proceed_portrait);
        $("button.ignore").html(lang.useguidehtml.button_skip);
        $("button.start").html(lang.useguidehtml.button_start);
    });
    $('body').find('.pageTitle').text(lang.showUseGuideSelfy.guide_take_portraits);
}

function showUseGuideNid() {
    $('body').find('.guideslide').remove();
    $("#formValueNid").hide();
    $('#voolo').append("<div class='guideslide nid-front' style=''></div>");
    $('.guideslide').load('useguidenid.html', function () {
        $(".slide-title").html(lang.useguidenidhtml.guide_capture_nid);
        $(".image-container .slide .desc span.none").html(lang.useguidenidhtml.none);
        $(".image-container .slide .desc span.done").html(lang.useguidenidhtml.done);
        $(".image-container .slide .desc span.sub-title-1").html(lang.useguidenidhtml.pls_choose_place);
        $(".image-container .slide .desc span.sub-title-2").html(lang.useguidenidhtml.place_nid);
        $("button.ignore").html(lang.useguidenidhtml.button_skip);
        $("button.start").html(lang.useguidenidhtml.button_start);
    });
    $('body').find('.pageTitle').text(lang.showUseGuideNid.guide_take_nid);
}

function showUseGuideBackNid() {
    $('body').find('.guideslide').remove();
    $("#formValueNid").hide();
    $('#voolo').append("<div class='guideslideback' style=''></div>");
    close_popup();
    var html = `<div class='box2 showMessage'>
                    <div class=''>
                        <div class='ico-success ico-120'></div>
                        <div class='statusTitle'>${lang.showUseGuideBackNid.capture_front_success}</div>
                        <div class='line'>
                            <span class='font-m'>Now</span>
                        </div>
                        <div class='refresh-ico'>
                            <img src='./assets/img/refresh-ico.png' width="20" height="20" />
                        </div>
                        <p style='text-align: center;'>
                            ${lang.showUseGuideBackNid.back_card_continue}
                        </p>
                        <div class="angled-borders">
                            <div id="f1_container">
                                <div id="f1_card" class="shadow">
                                    <div class="front face">
                                        <img src='./assets/img/cccd.png' width="115" />
                                    </div>
                                    <div class="back face center">
                                        <img src='./assets/img/cccd-2.png' width="115" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="width:100%">
                            <button class='payment-button' id="" style='margin-top:26px' onClick="runDocumentCaptureScreen('BACK')">${lang.showUseGuideBackNid.button_start}</button>
                        </div>
                    </div>
                </div> `;
    $('.guideslideback').html(html);
}