var express     = require('express'); 
 
// Nous définissons ici les paramètres du serveur.
var hostname    = 'localhost'; 
var port        = 3000;  
var app         = express(); 
var path        = require("path");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/login.html'));
  //__dirname : It will resolve to your project folder.
});

app.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/about.html'));
});

app.get('/sitemap',function(req,res){
  res.sendFile(path.join(__dirname+'/sitemap.html'));
});

app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port+""); 
});