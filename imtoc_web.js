//IMTOC by Salatiel, special thanks to RaZgRiZ for giving me some important tips about the output format.

window.onload = function(){
	 drfaultvalue = dr_razgriz;
	 document.getElementById('fileinput').addEventListener('change', importtxt, false);
	 datareader = document.getElementById("datareader");
	 datareader.value = drfaultvalue;
	 inputtext = document.getElementById("filestatus");
	 txtv = document.getElementById("text");
	 txtfile = new FileReader();
	 downloadbtn = document.getElementById("downloadbtn");
};

userfile = "untitled";
txtfilename = "untitled.txt";

function importtxt(evt) {
	downloadbtn.style = "background-color: #5d5d5d; cursor: unset; user-select: none";
	userfile = evt.target.files[0]; 
	txt = "";
	if (userfile) {
		inputtext.innerText = "Loading .txt File...";	

		txtfile.onload = function(e) {
			txt = txtfile.result;
			convert(txt);
		};
		txtfile.readAsText(userfile);
		
	} else { alert("Failed to import text file"); return}
};

function convert(text){
	inputtext.innerText = "Getting color data...";
	
	if (datareader.value){} else {datareader.value = drfaultvalue};
	imagewidth = text.substring( (text.indexOf(":") + 2), text.indexOf(","));
	imageheight = text.substr((text.indexOf(",") + 1));
	imageheight = imageheight.substr(0, imageheight.indexOf(","));
	
	bcfgvalue = document.getElementById("cfg");
	bcfgvalue.value = "";
	colordata = (text.match(/([#]+)([^\s]+)/g));
	
	if (colordata){
		formatdata = colordata.toString();
		formatdata = formatdata.replace(/\,/g, "\n");
		formatdata = formatdata.replace(/\#/g, "\t0x")
	} else {
		inputtext.innerText = "No color data found, use one of the links below to convert your image to a TXT file.";
		return;
	};
	
	if (imagewidth == ""){imagewidth = "0"};
	if (imageheight == ""){imageheight = "0"};
	if (userfile != "untitled"){
		txtfilename = (userfile.name).substr(0, txtfilename.indexOf("."));
	};
	
	bcfgvalue.value += "imtoc_imagew = \"" + imagewidth + "\"\n";
	bcfgvalue.value += "imtoc_imageh = \"" + imageheight + "\"\n";
	bcfgvalue.value += "imtoc_imagename = \"" + txtfilename + "\";\n";
	bcfgvalue.value += "imtoc_colordata = [\n" + formatdata + "\n]\n";
	bcfgvalue.value += "//Generated by IMTOC, a txt to cfg converter by Salatiel.\n\n" + datareader.value;
	download();
};

function download(){
	inputtext.innerText = "Done!";
	setTimeout(function(){inputtext.innerText = "You can download it now :-)"}, 2000);
	txtfilename = (userfile.name);
	fileName = txtfilename.substr(0, txtfilename.indexOf(".")) + ".cfg";
	
	//thanks to /u/Everman
	var blob = new Blob([ bcfgvalue.value ], {
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