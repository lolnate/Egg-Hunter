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
									: "") + "egg-hunter-selected";
							foundEgg++;
							oldHTML = elm.innerHTML;
						    var newHTML = "<span style='outline: 3px solid red'>" + oldHTML + "</span>";
						 	elm.innerHTML = newHTML;
							elm.scrollIntoView(true);
							var eggURL = "http://www.torn.com/" + href.nodeValue;
						}
					}
				}
				
				if (foundEgg == 0) {
					var statusImage = document.getElementById("egg-hunter-status-bar-icon");
					statusImage.setAttribute("src", "chrome://egghunter/skin/not-found.png");
					var sleep = Math.floor((Math.random() + 1.5) * 15 * 1000);
					setTimeout("eggHunter.pageRedirect()", sleep);
				} else {
					var statusImage = document.getElementById("egg-hunter-status-bar-icon");
					statusImage.setAttribute("src", "chrome://egghunter/skin/found-fake.png");
					for ( var i = 0, il = allImages.length; i < il; i++) {
						var src = allImages[i].src;
						if (src != null) {
							if (src.nodeValue.indexOf("eastereggimage") >= 0) {
								var imageValue = 0;
								imageValue = eggHunter.checkImage(allImages[i]);

								if (imageValue == 1) {
									statusImage = document.getElementById("egg-hunter-status-bar-icon");
									statusImage.setAttribute("src", "chrome://egghunter/skin/found-real.png");
									alert("Real egg found!");
									// Removed for testing.
									// window.content.location.href = eggURL;
								} else {
									// We found a fake egg, so redirect...
									alert("Fake egg found.");
									var sleep = Math.floor((Math.random() + 1.5) * 15 * 1000);
									setTimeout("eggHunter.pageRedirect()", sleep);
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
		    var canvas = document.createElementNS(
		        'http://www.w3.org/1999/xhtml', 'canvas');
		    canvas.width = imageContext.width;
		    canvas.height = imageContext.height;
		
		    var context = canvas.getContext("2d");
		    var egg = new Image();
		    egg.onload = function () {
		        context.drawImage(egg, 0, 0);
		    }
		    egg.src = imageContext.src;
		            
		    newWindow = window.open(imageContext.src, 'newWin', 'width=300,height=300');
		    newWindow2 = window.open('', 'newWin2', 'width=300,height=300');
		    newWindow2.document.body.appendChild(canvas);
			
		    var imgd = context.getImageData(0, 0, imageContext.width,
		        imageContext.height);
		    var pix = imgd.data;
		
		    var red = 0;
		    var green = 0;
		    var blue = 0;
		
		    for ( var i = 0, n = pix.length; i < n; i += 4) {
		        red = pix[i];
		        green = pix[i + 1];
		        blue = pix[i + 2];
		
		        if(red > 0 || green > 0 || blue > 0) {
		            //alert("Looks like a real egg to me!" + red + "/" + green + "/" + blue);
		            return 1;
		        }
		    }
		    
		    //alert("I guess it wasn't that real after all.");
		    return 0;
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
			window.content.location.href = urlArray[rand];
		},

		onPageUnload : function(aEvent) {

		}

	};
}();
window.addEventListener("load", eggHunter.init, false);
