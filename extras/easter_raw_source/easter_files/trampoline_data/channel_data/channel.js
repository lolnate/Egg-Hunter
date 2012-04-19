// iframe with actual channel handler for sub-domain Ajaxing

// strip off subdomain so we can chat with parent iframe
if (navigator.userAgent.indexOf("MSIE") != -1)
    document.domain = "torn.com";
else
    document.domain = window.location.hostname.replace(/[^.]*\.ajax\./, '');

var ajax = function(o, cookies) {
    // call inside timeout to ensure we're in the right
    // context (the subdomain, rather than the callers
    // domain), needed for Opera
    var xhr = null;
    
    setTimeout(function () {
        if (cookies)
            jQuery.each(cookies, function (n, v) {
                jQuery.cookie(n, v, { path: '/' });
            });
        
        xhr = jQuery.ajax(o);
    }, 0);

    return function () {
        if (xhr)
            xhr.abort();
    };
};
window.parent.onChannelLoadedCallback(ajax);
$(window).unbind('unload');
