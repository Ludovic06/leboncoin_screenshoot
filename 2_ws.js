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
