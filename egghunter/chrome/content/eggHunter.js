window.addEventListener("load", function load(event) {
	window.removeEventListener("load", load, false); // remove listener, no
														// longer needed
	eggHunter.init();
}, false);

var eggHunter = function() {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	return {
		init : function() {
			window.removeEventListener("load", eggHunter.init, false);
			gBrowser.addEventListener("DOMContentLoaded", function(aEvent) {
				var autoRun = prefManager
						.getBoolPref("extensions.egghunter.autorun");
				if (autoRun) {
					eggHunter.run(aEvent);
				}
			}, false);
		},

		run : function(aEvent) {
			if ((aEvent.originalTarget.nodeName == '#document')
					&& (aEvent.originalTarget.defaultView.location.href == gBrowser.currentURI.spec)
					&& (gBrowser.currentURI.spec != "about:blank")
					&& (gBrowser.currentURI.spec != "about:home")) {
				var head = content.document.getElementsByTagName("head")[0], style = content.document
						.getElementById("egg-hunter-style"), allLinks = content.document
						.getElementsByTagName("a"), allImages = content.document
						.getElementsByTagName("img"), foundEgg = 0;

				if (!style) {
					style = content.document.createElement("link");
					style.id = "egg-hunter-style";
					style.type = "text/css";
					style.rel = "stylesheet";
					style.href = "chrome://egghunter/skin/skin.css";
					head.appendChild(style);
				}

				for ( var i = 0, il = allLinks.length; i < il; i++) {
					elm = allLinks[i];
					var href = elm.getAttributeNode("href");
					if (href != null) {
						if (href.nodeValue.indexOf("eggfind") > 0) {
							elm.className += ((elm.className.length > 0) ? " "
									: "")
									+ "egg-hunter-selected";
							foundEgg++;
							var eggURL = "http://www.torn.com/"
									+ href.nodeValue;
						}
					}

				}
				if (foundEgg == 0) {
					var statusImage = document
							.getElementById("egg-hunter-status-bar-icon");
					statusImage.setAttribute("src",
							"chrome://egghunter/skin/not-found.png");
					var sleep = Math.floor((Math.random() + 1.5) * 15 * 1000);
					// alert(sleep);
					setTimeout("eggHunter.pageRedirect()", sleep);
				} else {
					var statusImage = document
							.getElementById("egg-hunter-status-bar-icon");
					statusImage.setAttribute("src",
							"chrome://egghunter/skin/found-fake.png");
					for ( var i = 0, il = allImages.length; i < il; i++) {
						var src = allImages[i].getAttributeNode("src");
						if (src != null) {
							if (src.nodeValue.indexOf("eastereggimage") >= 0) {
								var imageValue = 0;
								imageValue = eggHunter.checkImage(allImages[i]);

								if (imageValue == 1) {
									statusImage = document
											.getElementById("egg-hunter-status-bar-icon");
									statusImage
											.setAttribute("src",
													"chrome://egghunter/skin/found-real.png");
									alert("Real egg found!");
									window.content.location.href = eggURL;
								} else {
									// We found a fake egg, so redirect...
									alert("Fake egg found.");
									var sleep = Math
											.floor((Math.random() + 1.5) * 15 * 1000);
									setTimeout("eggHunter.pageRedirect()",
											sleep);
								}
							}
						}
					}
				}

				// add event listener for page unload
				aEvent.originalTarget.defaultView.addEventListener("unload",
						function(event) {
							eggHunter.onPageUnload(event);
						}, true);
			}
		},

		checkImage : function(imageContext) {
			// MATT BEGIN
			var canvas = document.createElementNS(
					'http://www.w3.org/1999/xhtml', 'canvas');
			canvas.width = imageContext.width;
			canvas.height = imageContext.height;

			var context = canvas.getContext("2d");
			context.drawImage(imageContext, 0, 0);

			var imgd = context.getImageData(0, 0, imageContext.width,
					imageContext.height);
			var pix = imgd.data;
			var alpha = 0;
			var red = 0;
			var green = 0;
			var blue = 0;
			// MATT END

			// Loop over each pixel and add the alpha to our current total.
			for ( var i = 0, n = pix.length; i < n; i += 4) {
				red = pix[i];
				green = pix[i + 1];
				blue = pix[i + 2];

				// Blue = 75/114/195
				// Black = 79/79/79
				// Brown = 134/103/89
				// Green = 66/145/47
				// Orange = 184/96/1
				// Pink = 197/52/192
				// Red = 195/75/75
				// White = 161/161/161
				// Yellow = 132/121/3

				if (red == 75 && green == 114 && blue == 195) {
					// alert("Blue egg found!");
					return 1;
				} else if (red == 79 && green == 79 && blue == 79) {
					// alert("Black egg found!");
					return 1;
				} else if (red == 134 && green == 103 && blue == 89) {
					// alert("Brown egg found!");
					return 1;
				} else if (red == 66 && green == 145 && blue == 47) {
					// alert("Green egg found!");
					return 1;
				} else if (red == 184 && green == 96 && blue == 1) {
					// alert("Orange egg found!");
					return 1;
				} else if (red == 197 && green == 52 && blue == 192) {
					// alert("Pink egg found!");
					return 1;
				} else if (red == 195 && green == 75 && blue == 75) {
					// alert("Red egg found!");
					return 1;
				} else if (red == 161 && green == 161 && blue == 161) {
					// alert("White egg found!");
					return 1;
				} else if (red == 132 && green == 121 && blue == 3) {
					// alert("Yellow egg found!");
					return 1;
				}
			}
		},

		pageRedirect : function() {
			var urlArray = new Array();
			urlArray[0] = "http://www.torn.com/city.php";
			urlArray[1] = "http://www.torn.com/messages.php";
			urlArray[2] = "http://www.torn.com/events.php";
			urlArray[3] = "http://www.torn.com/awards.php";
			urlArray[4] = "http://www.torn.com/index.php";
			urlArray[5] = "http://www.torn.com/item.php";
			urlArray[6] = "http://www.torn.com/jobs.php";
			urlArray[7] = "http://www.torn.com/newspaper.php";
			urlArray[8] = "http://www.torn.com/properties.php";
			urlArray[9] = "http://www.torn.com/education.php";
			urlArray[10] = "http://www.torn.com/jailview.php";
			urlArray[11] = "http://www.torn.com/hospitalview.php";
			urlArray[12] = "http://www.torn.com/casino.php";
			urlArray[13] = "http://www.torn.com/forums.php";
			urlArray[14] = "http://www.torn.com/bookie.php";

			var rand = Math.floor(Math.random() * 15);
			// alert(rand);
			window.content.location.href = urlArray[rand];
		},

		onPageUnload : function(aEvent) {

		}

	};
}();
window.addEventListener("load", eggHunter.init, false);
