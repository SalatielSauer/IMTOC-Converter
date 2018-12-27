//IMTOC by Salatiel, special thanks to RaZgRiZ for giving me some important tips about the output format.

window.onload = function(){
	 document.getElementById('fileinput').addEventListener('change', importtxt, false);

};
userfile = "untitled";
txtfilename = "untitled.txt";
function startfor(){

	text = document.getElementById("text").value;
	pixelines = text.split("\n");
	cfgvalue = document.getElementById("cfg");

	imageinfo = pixelines[0];
	imagewidth = imageinfo.substring( (imageinfo.indexOf(":") + 2), imageinfo.indexOf(","));
	imageheightx = imageinfo.substr((imageinfo.indexOf(",") + 1));
	imageheight = imageheightx.substr(0, imageheightx.indexOf(","));
	if (imagewidth == ""){imagewidth = "0"};
	if (imageheight == ""){imageheight = "0"};
	if (userfile != "untitled"){
		txtfilename = (userfile.name);
	};

	cfgvalue.value = 'imtoc_imagename = "' + txtfilename.substr(0, txtfilename.indexOf(".")) + '"\nimtoc_imagew = ' +  imagewidth + '\nimtoc_imageh = ' + imageheight + '\nimtoc_colordata = ['
	
	if (text.match("#")){} else {
		cfgvalue.value = cfgvalue.value + '\n 	echo "There is no color data to load"\n] \n//Generated by IMTOC, a txt to cfg converter by Salatiel.';
	}

	for (id = 2; id < pixelines.length; id++){
		curpixel = pixelines[id];
		linehexcolor = curpixel.substring((curpixel.indexOf("#") + 1));
		pixelhexcolor = linehexcolor.substr(0, linehexcolor.indexOf(" "));

		if (pixelhexcolor.length > 1){cfgvalue.value = cfgvalue.value + "\n" + '	0x' + pixelhexcolor + verifyhex(pixelhexcolor)};
	
		if(id == (pixelines.length - 1)){
			cfgvalue.value = cfgvalue.value + "\n] \n//Generated by IMTOC, a txt to cfg converter by Salatiel.";
		};
	};
};

function verifyhex(hco){
	if (hco.length == 6){return '00 '} else {return ' '};
};

function importtxt(evt) {
	txtv = document.getElementById("text");
    
    userfile = evt.target.files[0]; 

	if (userfile) {
		var txtfile = new FileReader();
		txtfile.onload = function(e) {
			txtv.value = txtfile.result;
		};
		txtfile.readAsText(userfile);
	} else { alert("Failed to load file");}
};

function downloadcfg(elId, txtfilename) {
	txtfilename = (userfile.name);
	filename = txtfilename.substr(0, txtfilename.indexOf(".")) + ".cfg";
    var elCFG = cfgvalue.value;
    var link = document.createElement('a');
    mimeType = 'text/plain';

    link.setAttribute('download', filename);
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elCFG));
    link.click(); 
};