/*
* These methods are included on every page 
*/

/* If not using firebug, define console and make log a NOOP */
if (typeof console == 'undefined') {
        var console = {};
        console.log = function(msg) {
                return;
        };
}

function myTimestamp(){
    tstmp = new Date();
    return tstmp.getTime();
}

function newWindow(htmlfile) {
  htmlWindow = window.open(htmlfile, 'newWin', 'width=250,height=146,toolbar=no,scrollbars=no');
  htmlWindow.focus();
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function addCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

jQuery.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return jQuery.getUrlVars()[name];
  }
});


function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}

function isset () {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: FremyCompany
    // +   improved by: Onno Marsman
    // *     example 1: isset( undefined, true);
    // *     returns 1: false
    // *     example 2: isset( 'Kevin van Zonneveld' );
    // *     returns 2: true
    
    var a=arguments, l=a.length, i=0;
    
    if (l===0) {
        throw new Error('Empty isset'); 
    }
    
    while (i!==l) {
        if (typeof(a[i])=='undefined' || a[i]===null) { 
            return false; 
        } else { 
            i++; 
        }
    }
    return true;
}

// This is for loader.php
//jQuery(document).ready(function()
//{
//    if(jQuery.getUrlVar('page')) {
//        jQuery("#loadedContent").load(jQuery.getUrlVar('page'));
//    }
//
//});

function loadImage(path){
    //change the uri inside the load() brackets to load a page relative to your domain
    jQuery("#loadedContent").load(path);
}

function startCountdowns() {
    var refreshingEnergy = false;
    
    jQuery(".countdown").each(function () {
        var e = jQuery(this);
        if (!isNaN(+e.data("until"))) {
            var options = {
                until: +e.data("until"),
                layout: e.data("layout")
            };
            
            if (e.data("on-expiry") == "refreshenergy")
                options.onExpiry = function () {
                    if (refreshingEnergy)
                        return;
                    
                    refreshingEnergy = true;
                    
                    jQuery.ajax({
                        type: "POST",
                        url: "/refreshenergy.php",
                        timeout: 10 * 1000,
                        success: function (data) {
                            jQuery("#player-stats").html(jQuery(data).html());
                            startCountdowns();
                            refreshingEnergy = false;
                        },
                        error: function () {
                            refreshingEnergy = false;
                        }
                    });
                };

            e.countdown(options);
        }
    });
}

jQuery(document).ready(function () {
    startCountdowns();
});

// Google ana
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));

//var pageTracker = _gat._getTracker("UA-2507098-1");
//pageTracker._trackPageview();
//pageTracker._setDomainName(".torn.com");
//pageTracker._setAllowHash(false);

