/**
 * Created by jtumi on 1/26/2016.
 */
var http = require('http'),
    express = require('express');
    app = express();

//app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));//Will send CSS/JS/IMG in public folder to be displayed

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');//Sends index.html file to be displayed
});

app.listen(3000);
console.log("Server Running on port 3000");
