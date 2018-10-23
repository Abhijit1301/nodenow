var http = require('http');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');

//Instantiating HTTP server
var server = http.createServer(function(req,res){
    unifiedServer(req,res);
});

//Running HTTP server on environment's port
server.listen(80);

//Unified server for both HTTP and HTTPS requests
var unifiedServer = function(req,res){
    
    //Get the URL and parse it
    var parsedUrl = url.parse(req.url,true);

    //Get the path
    var path = parsedUrl.pathname;
    path = path.replace(/^\/+|\/+$/g,'');

    //Get the http method
    var method = req.method;

    //Get the query string object
    var queryStringObject = parsedUrl.query;

    //Get the header object
    var headers = req.headers;

    res.setHeader('content-type','application/json')
    res.writeHead(200);
    res.end(JSON.stringify({message:'hello! brother mine!'}));
}