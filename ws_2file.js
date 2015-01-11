function setup(){
var mkdirp = require('mkdirp');
mkdirp('./url2screenshoot/incoming', function(err) { });
};

function addurlifile(file_url){
var fs = require('fs');
fs.appendFile('./url2screenshoot/incoming/url.list', file_url+"\n", function (err) {
    if(err) {
        console.log(err);
    } else {
        console.log("URL saved!");
    }
});
};

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var fss = require('fs');

setup();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.get('/screen_shoot/:url', function(req, res) {
	var url = req.params.url;
	var now = new Date();
	var now4console = now.getFullYear()+"-"+("0"+(now.getMonth()+1)).substr(-2)+"-"+("0"+(now.getDate())).substr(-2)+":"+("0" + now.getHours()).substr(-2)+":"+("0"+now.getMinutes()).substr(-2)+":"+("0" + now.getSeconds()).substr(-2)
	console.log(now4console + " --- Screen Shoot ask for :" + url);
	fss.appendFile('./history.ws', now4console + " --- Screen Shoot ask for :" + url+"\n", function (err) {
	if(err) {
		console.log(err);
	}
});

	var url2 = url.split("=")[1];
	addurlifile(url2);
	//res.send('url : ' + url2 + ' saved as ' + ' !'); 
	res.send('ok');
});

app.get('/about', function(req,res) {
	res.send('ok');
});

app.get('/', function(req,res) {
	res.send('Bad Request !');
});

 
app.listen(process.env.PORT || 8080);
console.log("saving to ./url2screenshoot/incoming/url.list\n\n\n");
console.log("pour tester :");
console.log("http://127.0.0.1:8080/screen_shoot/url=urlencodedurl");
console.log("");
console.log("ex:");
console.log("http://85.169.64.54:8080/screen_shoot/url=http%3A%2F%2Fwww.leboncoin.fr%2Fventes_immobilieres%2F708072402.htm\n\n\n");
console.log("lbc_listener ready on port 8080");
