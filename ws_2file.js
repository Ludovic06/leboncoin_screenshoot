

function phantomjs(file_url) {

    // extract the file name
    var file_name = "phantomjs.log";
    // create an instance of writable stream
//    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
    // execute curl using child_process' spawn function
//    var curl = spawn('curl', [file_url]);
console.log("spawning phantomjs");
var spawn = require('child_process').spawn;
    var curl = spawn('phantomjs /home/linaro/lbc_sshoot/lbc.js', file_url);
console.log("spawned");
    // add a 'data' event listener for the spawn instance
 //   curl.stdout.on('data', function(data) { file.write(data); });
    // add an 'end' event listener to close the writeable stream
   // curl.stdout.on('end', function(data) {
   //     file.end();
    //    console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
   // });
    // when the spawn child process exits, check if there were any errors and close the writeable stream
    curl.on('exit', function(code) {
        if (code != 0) {
            console.log('Failed: ' + code);
        }
    });
};

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
setup();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.get('/screen_shoot/:url', function(req, res) {
	var url = req.params.url;
	console.log("Screen Shoot ask for :" + url);
	var url2 = url.split("=")[1];
//	phantomjs(url2);
	addurlifile(url2);
	res.send('url : ' + url2 + ' saved as ' + ' !'); 
});

app.get('/', function(req,res) {
	res.send('Bad Request !');
});
 
app.listen(process.env.PORT || 8080);
console.log("pour tester :");
console.log("http://127.0.0.1:8080/screen_shoot/url=urlencodedurl");
console.log("");
console.log("ex:");
console.log("http://85.169.64.54:8080/screen_shoot/url=http%3A%2F%2Fwww.leboncoin.fr%2Fventes_immobilieres%2F708072402.htm%3Fca%3D21_s");
console.log("Go lbc_listener GO!, port 8080");
