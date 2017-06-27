/**
 * Created by ggwtest on 17/1/31.
 */
var mysql = require('mysql');
var http = require('http');
var common = require('./common');
var rxjs = require('rxjs');
//创建响应服务
http.createServer(function(request, response) {
    var url = request.url;
    var headers = request.headers;
    var method = request.method;
    var body = [];
    request.on('error', function(err) {
        common.handleError(err,"create server");
    }).on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        if (url == '/recommend'){
            var connection = mysql.createConnection({
                host: common.host,
                user: common.user,
                password: common.password,
                database: common.databaseName,
                multipleStatements: true
            });
            connection.connect();
            var sql = 'select * from '+common.recommendTableName ;
            connection.query(sql,function(err, rows, fields) {
                if (err) throw common.handleError(err,'query recommend anchors');
                // console.log('查询结果为:', rows);
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.setHeader('Access-Control-Allow-Origin','*');
                response.write(JSON.stringify({'recommendAnchors':rows}));
                response.end();
            });
            connection.end();
        }else{
            // BEGINNING OF NEW STUFF
            response.on('error', function(err) {
                common.handleError(err,'response');
            });
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            // Note: the 2 lines above could be replaced with this next one:
            // response.writeHead(200, {'Content-Type': 'application/json'})
            response.setHeader('Access-Control-Allow-Origin','*');

            var responseBody = {
                headers: headers,
                method: method,
                url: url,
                body: body
            };

            response.write(JSON.stringify(responseBody));
            response.end();
        }

    });

}).listen(8080);

