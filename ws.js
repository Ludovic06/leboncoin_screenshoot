
var download_file_curl = function(file_url) {

    // extract the file name
    var file_name = url.parse(file_url).pathname.split('/').pop();
    // create an instance of writable stream
    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
    // execute curl using child_process' spawn function
    var curl = spawn('curl', [file_url]);
    // add a 'data' event listener for the spawn instance
    curl.stdout.on('data', function(data) { file.write(data); });
    // add an 'end' event listener to close the writeable stream
    curl.stdout.on('end', function(data) {
        file.end();
        console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
    });
    // when the spawn child process exits, check if there were any errors and close the writeable stream
    curl.on('exit', function(code) {
        if (code != 0) {
            console.log('Failed: ' + code);
        }
    });
};

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.get('/screen_shoot/:url', function(req, res) {
	var url = req.params.url;
	console.log("Screen Shoot ask for :" + url);
	res.send('url : ' + url + ' saved as ' + ' !'); 
});

app.get('/', function(req,res) {
	res.send('Bad Request !');
});
 
app.listen(process.env.PORT || 8080);
console.log("Go lbc_listener GO!");
