//IMTOC 2.0 by Salatiel, special thanks to RaZgRiZ for giving me some important tips about the output format.

window.onload = function(){
	drfaultvalue = dr_razgriz;
	imageLoader = document.getElementById('fileinput');
	imageLoader.addEventListener('change', importImg, false);
	canvas = document.getElementById('imageCanvas');
	ctx = canvas.getContext('2d');

	datareader = document.getElementById("datareader");
	datareader.value = drfaultvalue;
	inputtext = document.getElementById("filestatus");
	downloadbtn = document.getElementById("downloadbtn");
};

userfile = "untitled";
txtfilename = "untitled.cfg";

function importImg(e){
    var reader = new FileReader();
	userfile = e.target.files[0];
	if (userfile){
		inputtext.innerText = "Reading image...";
		reader.onload = function(event){
			var img = new Image();
			img.onload = function(){
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img,0,0);
				startread();
			}
			
			img.src = event.target.result;
		}
		reader.readAsDataURL(e.target.files[0]);
	} else {
		downloadbtn.style = "";
	};
};

function rgb2hex(rgb){
	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	return (rgb && rgb.length === 4) ? "0x" + ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) + ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
};

function startread(){
	datareader = document.getElementById("datareader");
	colordata = "";
	colordata += "imtoc_imagename = \"" + userfile.name + "\";\n";
	colordata += "imtoc_imagew = \"" + canvas.width + "\";\n";
	colordata += "imtoc_imageh = \"" + canvas.height + "\";\n";
	colordata += "imtoc_colordata = [";
	var p = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 
	for (i = 0; i < p.length; i += 4) {
		dcolor = ("rgba(" + p[i] + "," + p[i + 1] + "," + p[i + 2] + "," + p[i + 3] + ")");
		var hex = rgb2hex(dcolor);
		inputtext.innerText = "Getting colors...";
		colordata += hex + " ";
		if (i == (p.length - 4)){
			colordata += "]\n";
			colordata += "//Generated by IMTOC, image -> cfg converter by Salatiel.\n\n" + datareader.value;
			download();
			return;
		};
	};
};

function download(){
	inputtext.innerText = "Done!";
	setTimeout(function(){inputtext.innerText = "You can download it now :-)"}, 1500);
	txtfilename = (userfile.name);
	fileName = txtfilename.substr(0, txtfilename.indexOf(".")) + ".cfg";
	
	//thanks to /u/Everman
	var blob = new Blob([ colordata ], {
		type : ";charset=utf-8;"
	});

	if (window.navigator.msSaveBlob) {
		navigator.msSaveBlob(blob, fileName);
	} else {
		var csvUrl = URL.createObjectURL(blob);
		$('#downloadbtn').attr({
			'download': fileName,
			'href': csvUrl
		});
		downloadbtn.style = "";
	};
};