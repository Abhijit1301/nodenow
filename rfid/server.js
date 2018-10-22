var http = require('http');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var con = require('./dbMySql');

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

    //req.on('end',function(){

        //prepare data object for handler
        var data = {
            path : path,
            method : method,
            queryStringObject : queryStringObject,
            headers : headers
        };

        //choose handler for requested path
        var chosenHandler = typeof(router[path])!== "undefined" ? router[path] : handlers.notFound ;
        console.log(chosenHandler,typeof(chosenHandler));
        //call the handler
        chosenHandler(data,function(status,payload){
            var statusCode = typeof(status) !== "number" ? 200 : status;

            var payload = typeof(payload) !== "object" ? {} : payload;

            var payloadString = JSON.stringify(payload);

            res.setHeader('content-type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    //});
}
//handler object 
var handlers = {};

//notFound handler i.e no route found
handlers.notFound = function(data,callback){
    //console.log(data);
    callback(404);
};

//handler functions
handlers.hardware = function(data,callback){
    console.log(data);
    var sql = "SELECT * FROM usersInfo WHERE rfidSeriel = '"+data.queryStringObject.seriel+"';";
    con.query(sql,function(err,result){
        console.log(result);
        if(result.length == 0){
            sql = "INSERT into usersInfo (rfidSeriel, presence, status) VALUES ('"+data.queryStringObject.seriel+"',0,00);";
            con.query(sql,function(err1,result1){
                if(err1)
                    callback(405,{msg:"error occurred while inserting values into database"});
                else
                    callback(200,{msg:"seriel added successfully"});
            });
        }
        else{
            sql = "UPDATE usersInfo SET presence = 1 WHERE rfidSeriel = '"+data.queryStringObject.seriel+"' AND status = 01;";
            con.query(sql,function(err1,result1){
                if(err1)
                    callback(405,{msg:"error occurred while updating presence column"});
                else
                    callback(200,{msg:"presence updated successfully"});
            });
        }
    });
};

//handler functions
handlers.visual = function(data,callback){
    console.log(data);
    var payload = {};
    var sql = "";

    if(data.queryStringObject.name === ""){
        sql = "SELECT * FROM usersInfo WHERE status = 00;";
        con.query(sql,function(err,result){
            if(err)
                callback(405,{msg:"failed to connect to db, visual case"});
            else{
                console.log(result);
                if(result.length > 0){
                    payload.seriel = result[0].rfidSeriel;
                    callback(200, payload);   
                }
                else{
                    sql = "SELECT * FROM usersInfo WHERE presence = 1 AND status = 11"
                    con.query(sql,function(err1,result1){
                        if(err1)
                            callback(405,{msg:"error occurred while getting presence details"});
                        else{
                            for(var i = 0; i < result1.length; i++){
                                payload.push({name:result1[i].name, seriel : result1[i].seriel, status: result1[i].status});
                            }
                            callback(200, payload);
                        }
                    });
                }
            }
        });    
    }
    else{
        sql = "UPDATE usersInfo SET status = 01 AND name = '"+data.queryStringObject.name+"' WHERE rfidSeriel = '"+data.queryStringObject.seriel+"';";
        con.query(sql,function(err1,result1){
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
