/**
 * Created by ggwtest on 17/1/31.
 */
var mysql = require('mysql');
var http = require('http');
var responsebody = null;

var connection = mysql.createConnection({
   host:'localhost',
    user     : 'root',
    password : '',
    database : 'LiveStreamingAssistant'
});
connection.connect(function (err) {
    if (err){
        console.error(err.message);
        return;
    }
    console.log('connect as id '+ connection.threadId);
});


http.createServer(function(request, response) {
    var url = request.url;
    request.on('error', function(err) {
        console.error(err);
    }).on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        try {
            response.on('error', function (err) {
                console.error(err);
                return;
            });
                connection.query('select * from recommend_anchors', function (err, results, fields) {
                    if (err) console.log(err.message);
                    var jsonResult = "\"recommendAnchors\":"+JSON.stringify(results);
                    responseWith(jsonResult,response);
                });

                connection.query('select * from famous_anchors', function (err, results, fields) {
                    if (err) console.log(err.message);
                    var jsonResult = "\"famousAnchors\":"+JSON.stringify(results);
                    responseWith(jsonResult,response);
                });
        } catch (err){
            console.log(err.message);
        }
        // Note: the 2 lines above could be replaced with this next one:
        // response.end(JSON.stringify(responseBody))

        // END OF NEW STUFF
    });
}).listen(8080);
function responseWith(body,response) {
    if (responsebody == null){
        responsebody = "{"+body+","
    }else{
        responsebody += body+"}";
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin','*');
        // Note: the 2 lines above could be replaced with this next one:
        // response.writeHead(200, {'Content-Type': 'application/json'})
        response.write(responsebody);
        response.end();
        responsebody = null;
    }

}