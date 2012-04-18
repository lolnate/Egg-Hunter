window.addEventListener("load", function load(event) {
	window.removeEventListener("load", load, false); // remove listener, no longer needed
	eggHunter.init();
}, false);

var eggHunter = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		init : function () {
			window.removeEventListener("load", eggHunter.init, false);
			gBrowser.addEventListener("DOMContentLoaded", function (aEvent) {
				var autoRun = prefManager.getBoolPref("extensions.egghunter.autorun");
				if (autoRun) {
					eggHunter.run(aEvent);
				}
			}, false);
		},

		run : function (aEvent) {
			if ((aEvent.originalTarget.nodeName == '#document') && 
				(aEvent.originalTarget.defaultView.location.href == gBrowser.currentURI.spec) &&
				(gBrowser.currentURI.spec != "about:blank") &&
				(gBrowser.currentURI.spec != "about:home")) 
			{
				var head = content.document.getElementsByTagName("head")[0],
					style = content.document.getElementById("egg-hunter-style"),
					allLinks = content.document.getElementsByTagName("a"),
					allImages = content.document.getElementsByTagName("img"),
					foundEgg = 0;

				if (!style) {
					style = content.document.createElement("link");
					style.id = "egg-hunter-style";
					style.type = "text/css";
					style.rel = "stylesheet";
					style.href = "chrome://egghunter/skin/skin.css";
					head.appendChild(style);
				}	

				for (var i=0, il=allLinks.length; i<il; i++) {
					elm = allLinks[i];
					var href = elm.getAttributeNode("href");
					if (href != null) {
						if (href.nodeValue.indexOf("eggfind") > 0) {
							elm.className += ((elm.className.length > 0)? " " : "") + "egg-hunter-selected";
							foundEgg++;
						}
					}
				
				}
				if (foundEgg === 0) {
					var statusImage = document.getElementById("egg-hunter-status-bar-icon");
					statusImage.setAttribute("src", "chrome://egghunter/skin/not-found.png");
				}
				else {
					var statusImage = document.getElementById("egg-hunter-status-bar-icon");
					statusImage.setAttribute("src", "chrome://egghunter/skin/found-fake.png");
					for (var i = 0, il = allImages.length; i < il; i++) {
						var src = allImages[i].getAttributeNode("src");
						if (src != null) {
							if (src.nodeValue.indexOf("eastereggimage") > 0) {
								var imageValue = eggHunter.checkImage(allImages[i]);
								if (imageValue > 40) {
									statusImage = document.getElementById("egg-hunter-status-bar-icon");
									statusImage.setAttribute("src", "chrome://egghunter/skin/found-real.png");
								}
							}
						}
					}
					alert("Found a link that looks like an egg!");
				}
				// add event listener for page unload   
				aEvent.originalTarget.defaultView.addEventListener("unload", function(event){ eggHunter.onPageUnload(event); }, true);
			}
		},

		checkImage : function(imageContext) {
			var imgd = imageContext.getImageData(0, 0, imageContext.getAttribute('width'), imageContext.getAttribute('height'));
			var pix = imgd.data;
			var alpha = 0;

			// Loop over each pixel and add the alpha to our current total.
			for (var i = 0, n = pix.length; i < n; i+=4) {
				alpha += pix[i+3];
			}

			return alpha / (pix.length/4);
		},

		onPageUnload : function(aEvent) {

		}

	};
}();
window.addEventListener("load", eggHunter.init, false);
