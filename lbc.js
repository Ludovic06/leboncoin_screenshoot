
//location friendly
// new LBC design
// no pub and no parasite menu !
// pdf
// ville in filename

//1.2.4

function waitFor ($config) {
    $config._start = $config._start || new Date();

    if ($config.timeout && new Date - $config._start > $config.timeout) {
        if ($config.error) $config.error();
        if ($config.debug) console.log('timedout ' + (new Date - $config._start) + 'ms');
        return;
    }

    if ($config.check()) {
        if ($config.debug) console.log('success ' + (new Date - $config._start) + 'ms');
        return $config.success();
    }

    setTimeout(waitFor, $config.interval || 0, $config);
}


function click(el){
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}


function getref(url){
//    console.log("ludo2");
    var ref_ad;
    if (url.indexOf("leboncoin") !=-1){
        console.log("ludo3");
        if (url.indexOf("vente") !=-1){
            ref_ad = url.split("leboncoin.fr/ventes_immobilieres/")[1].split(".")[0];
        }
        else if (url.indexOf("location") !=-1){
            ref_ad = url.split("leboncoin.fr/locations/")[1].split(".")[0];
        }
        else {
            console.log("unrecognized url : " + url);
            phantom.exit();
        }
        goto_lbc(url,ref_ad)
        //console.log( "split ref : " + url.split("leboncoin.fr/ventes_immobilieres/")[1].split(".")[0])
    }
    else if (url.indexOf("seloger") !=-1){
//        console.log("ludo4");
        var tempref=url.split("/");
        console.log("ludo_ref = " + tempref[tempref.length - 1].split(".")[0]);
        ref_ad = tempref[tempref.length - 1].split(".")[0];
        goto_other(url, ref_ad)
    }
    else {
        console.log("unrecognized url : " + url);
        phantom.exit();
    }
}


function save_to_pic_and_exit(page, id_annonce){
    page.render(id_annonce +".png");
    page.render(id_annonce +".pdf");
    console.log("saved to file : " + id_annonce + ".png");
    phantom.exit();
}


function goto_other(url, id_annonce){
    var page = new WebPage();
    page.viewportSize = {
        width: 1280,
        height: 800
    };

     page.open(url, function (status) {
        console.log("toto")
        if ('success' !== status) {
            console.log("Error");
        } else {
            console.log("Page exists ! Simulate the click (prout):");
            save_to_pic_and_exit(page, id_annonce)
        }
     });
    console.log("by")
    phantom.exit()
}

function goto_lbc(url, id_annonce){
    var page = new WebPage();
    var ville = "";


    page.viewportSize = {
        width: 1280,
        height: 800
    };

    page.paperSize = {
    format        : "A4",
    orientation    : "portrait",
    margin        : { left:"1cm", right:"1cm", top:"1cm", bottom:"1cm" }
};


    page.open(url, function (status) {

        if ('success' !== status) {
            console.log("Error");
        } else {
            console.log("Page exists ! Simulate the click (prout):");


// PUB OFF
        var ville = "ville";
        ville = page.evaluate(function() {
            $('.oas-middle').css('display', 'none');
            $('.oas-x12').css('display', 'none');
            $('.lbc_option_box.lbc_actions').css('display', 'none');
            $('.oas-x11').css('display', 'none');
            $('body').css('background', 'white');
            $('page_width').css('background', 'white');
            $('#account_login_f').css('background', 'white');
            $('.boutique_image').css('display', 'none');
            $('.boutique_link').css('display', 'none');
            $('#footer').css('display', 'none');
            $('.bottomLinks').css('display', 'none');
            $('#headermain').css('display', 'none');
            $('#nav_main').css('display', 'none');
            $('.account_screen').css('display', 'none');
            $('.lbc_option_box_title').css('display', 'none');


            return $('div.floatLeft:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)').html();
        });
        console.log(ville);

        var elem = page.evaluate( function() {
            // find element to send click to
                return document.querySelector( '#phoneNumber > a' );
            });

            if(elem){
                console.log("#phoneNumber OK")
            }else {
                console.log("#phoneNumber NOK")
                save_to_pic_and_exit(page,id_annonce);
            }


        var offset = page.evaluate(function() {
            return $('#phoneNumber > a').offset();
        });

        // first click for phone number then wait for phone picture
        page.sendEvent('click', offset.left , offset.top );

            waitFor({
                debug: true,  // optional
                interval: 100,  // optional
                timeout: 1000,  // optional
                check : function () {
                    var check = page.evaluate(function () {
                            // old test return $('#phoneNumber img').is(':visible');
                            var phonenumberisvisible = false;
                            if($('.AdPhonenum')[0]) {
                                phonenumberisvisible = true;
//                                console.log($('.AdPhonenum')[0]);
                            }
                            return phonenumberisvisible ;
                        });

                    console.log("waitfor invoke check:", check);
                    return check;
                },
                success : function () {
                    console.log("waitfor invoke success");

                    setTimeout(function(){
                        save_to_pic_and_exit(page, ville+"_"+id_annonce);
                    },1);

                },
                error : function () {
                    console.log("waitfor invoke error");
                    phantom.exit();
                }
            });
        }
    });
}


//########################
//#####     main     #####
//########################

// Checking args :
var system = require('system');
var pageUrl = "http://www.leboncoin.fr/montres_bijoux/553822663.htm?ca=21_s";

if (system.args.length === 2) {
    //console.log('arg[1] = '+ system.args[1]);
    pageUrl = system.args[1];
    //console.log('url = ' + pageUrl);
    //phantom.exit();
} else {
    console.log("Elle est ou l'url LBC ou seloger ???");
    phantom.exit();

    system.args.forEach(function (arg, i) {
            console.log(i + ': ' + arg);
    });
}

//init de la page


getref(pageUrl);
//console.log("ludo1");
//console.log("id_annonce = " + id_annonce);
