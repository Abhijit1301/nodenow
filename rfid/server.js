var http = require('http');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var con = require('./dbMySql');
var path = require('path');

//Instantiating HTTP server
var server = http.createServer(function(req,res){
    unifiedServer(req,res);
});

//Running HTTP server on environment's port
server.listen(8080);

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

    //Get payload stream
    var decoder = new stringDecoder('UTF-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
        //console.log(decoder.write(data)+"\n");
    });

    req.on('end',function(){
        buffer += decoder.end();

        //prepare data object for handler
        var data = {
            path : path,
            method : method,
            queryStringObject : queryStringObject,
            headers : headers,
            payload : buffer,
        };
        //choose handler for requested path
        var chosenHandler;
        if(typeof(router[path]) === "undefined"){
            console.log("if case");
            handlers.notFound(req,res);
            return;
        }
        else{
            chosenHandler = router[path];
            console.log("else case");
        }

        //call the handler
        chosenHandler(data,function(status,payload){
            var statusCode = typeof(status) !== "number" ? 200 : status;

            var payload = typeof(payload) !== "object" ? {} : payload;

            var payloadString = JSON.stringify(payload);

            res.setHeader('content-type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
    
}
//handler object 
var handlers = {};

//notFound handler i.e no route found
handlers.notFound = function(request,response){
    //console.log(data);
    var filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './view/webView.html';
    }

    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
};


//handler functions
handlers.hardware = function(data,callback){
    console.log("in hardware route");
    console.log(data.payload);
    var sql = "SELECT * FROM usersInfo WHERE rfidSeriel = "+parseInt(data.payload)+"";
    con.query(sql,function(err,result){
        console.log(result);
        if(result.length == 0){
            sql = "INSERT into usersInfo (rfidSeriel, presence, status) VALUES ("+parseInt(data.payload)+",0,0);";
            con.query(sql,function(err1,result1){
                if(err1)
                    callback(405,{status:10, msg:"error occurred while inserting values into database"});
                else
                    callback(200,{status:10, msg:"seriel added successfully"});
            });
        }
        else{
            sql = "UPDATE usersInfo SET presence = 1 WHERE rfidSeriel = '"+parseInt(data.payload)+"' AND status = 1;";
            con.query(sql,function(err1,result1){
                if(err1)
                    callback(405,{status : 10, msg:"error occurred while updating presence column"});
                else
                    callback(200,{status: 10, msg:"presence updated successfully"});
            });
        }
    });
};

//handler functions
handlers.visual = function(data,callback){
    console.log("in visual route");
    console.log(data.method, data.queryStringObject);
    var payload = {};
    var arr = [];
    var sql = "";

    if(data.method === 'POST'){
        sql = "SELECT * FROM usersInfo WHERE status = 00;";
        con.query(sql,function(err,result){
            if(err)
                callback(405,{msg:"failed to connect to db, visual case"});
            else{
                console.log(result);
                if(result.length > 0){
                    payload.status = 1;
                    for(var i = 0; i < result.length; i++)
                        arr.push({seriel : result[0].rfidSeriel}) ;
                    payload.info = arr;
                    callback(200, payload);   
                }
                else{
                    sql = "SELECT * FROM usersInfo WHERE presence = 1 AND status = 11"
                    con.query(sql,function(err1,result1){
                        if(err1)
                            callback(405,{msg:"error occurred while getting presence details"});
                        else{
                            payload.status = 2;
                            for(var i = 0; i < result1.length; i++){
                                arr.push({name:result1[i].name, seriel : result1[i].seriel, status: result1[i].status});
                            }
                            payload.info = arr;
                            callback(200, payload);
                        }
                    });
                }
            }
        });    
    }
    else{
        console.log('got data from form submission',data.queryStringObject.name, parseInt(data.queryStringObject.seriel));
        sql = "UPDATE usersInfo SET status = 01, name = '"+data.queryStringObject.name+"' WHERE rfidSeriel = "+parseInt(data.queryStringObject.seriel);
        con.query(sql,function(err1,result1){
            console.log('\n updating name and seriel')
            console.log(result1);
            if(err1)
                callback(405,{msg:"error occurred while updating name & status column"});
            else
                callback(200,{msg:"name updated successfully"});
        });
    }        
};

//router
var router = {
    visual : handlers.visual,
    hardware : handlers.hardware
};
