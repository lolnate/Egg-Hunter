	function run() {
		allLinks = content.document.getElementsByTagName("a");
		allImages = content.document.getElementsByTagName("img");
		foundEgg = 0;

		for ( var i = 0, il = allLinks.length; i < il; i++) {
			elm = allLinks[i];
			var href = elm.getAttributeNode("href");
			if (href != null) {
				if (href.nodeValue.indexOf("eggfind") > 0) {
					foundEgg++;
				}
			}

		}
		if (foundEgg > 0) {
			for ( var i = 0, il = allImages.length; i < il; i++) {
				var src = allImages[i].getAttributeNode("src");
				if (src != null) {
					if (src.nodeValue.indexOf("hiddenimage") >= 0) {
						var imageValue = 0;
						imageValue = checkImage(allImages[i].getContext("2d"));

						if (imageValue == 1) {
							alert("Real egg found!");
						} else {
							alert("Fake egg found.");
						}
					}
				}
			}
		}
	}

	function checkImage(imageContext) {
		// MATT BEGIN
		var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
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
	}
