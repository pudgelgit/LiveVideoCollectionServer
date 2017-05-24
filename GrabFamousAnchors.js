/**
 * Created by ggwtest on 16/11/7.
 */
var url = require('url');
var https = require('https');
var http = require('http');

var promise = require('promise');
var common = require('./aa');
var mysql = require('mysql');
var headers = request.headers;
var method = request.method;
var url = request.url;
var body = [];

Object.defineProperty(global, '__stack', {
    get: function(){
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack){ return stack; };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function(){
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__file', {
    get: function(){
        return __stack[1].getFileName().split('/').slice(-1)[0];
    }
});
var panda = {
    name:'熊猫',
    recommendIndex:[common.pandaLOLRecommend,common.pandaOWRecommend,common.pandaHSRecommend,common.pandaDOTA2Recommend,common]
    http:http,
    parseRecommendIndex:function (htmlContent,cate) {
        var  recommendData = [];
        var $ = cheerio.load(htmlContent);
        var host = 'www.panda.tv';
        var lis = $('.video-list-item-wrap');
        lis.each(function (i,elem) {
            var a = $(this);
            var anchorItem = new Object();
            anchorItem.roomName = a.find('.video-title').text();
            var link = a.attr('href');
            var temp = url.parse(link);
            if (temp.host == null){
                temp.protocol = 'http:'
                temp.host = host;
                temp.hostname = host;
                link = url.format(temp);
            }
            anchorItem.address = link;
            anchorItem.anchorName = a.find('.video-nickname').text();
            anchorItem.viewNum = a.find('.video-number').text();
            anchorItem.site = 'panda';
            anchorItem.cate = cate;
            recommendData.push(anchorItem);
        });
        return recommendData;
    }
};

var douyu = {
    name:'斗鱼',
    recommendIndex:[common.douyuLOLRecommend,common.douyuOWRecommend,common.douyuDOTA2Recommend,common.douyuHSRecommend,common.douyuTVGameRecommendSite];
http:https,
    parseRecommendIndex:function (htmlContent,cate) {
    var recommendData = [];
    var $ = cheerio.load(htmlContent);
    var host = 'www.douyu.com';
    var lis = $('ul#live-list-contentbox li a');
    lis.each(function (i,elem) {
        var a = $(this);
        var anchorItem = new Object();
        anchorItem.roomName = a.attr('title');
        var link = a.attr('href');
        var temp = url.parse(link);
        if (temp.host == null){
            temp.protocol = 'https:';
            temp.host = host;
            temp.hostname = host;
            link = url.format(temp);
        }
        anchorItem.address = link;
        anchorItem.anchorName = a.find('.dy-name').text();
        anchorItem.viewNum = a.find('.dy-num').text();
        anchorItem.site = 'douyu';
        anchorItem.cate = cate;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
};

//LOL推荐项目
function recommendLOL() {
    var recommendData = [];
    var sites = [panda,douyu];
    var promises = [];
    for (var i = 0 ; i < sites.length; i++)promises.push(promiseGetRecommendIndex(sites[i],common.cateLOL));
    Promise.all(promises).then(function (values) {
        values[3]=null;
        for (var i = 0;i<values.length;i++){
            if (values[i] != null){
                recommendData = recommendData.concat(values[i]);
            }
        }
        if (recommendData.length > 0)
        {
            writeRecommendDataToDb(recommendData,common.cateLOL);
        }
    });

    //抓取推荐主页数据
    function promiseGetRecommendIndex(object,cate) {
        return new Promise(function (solve,reject) {
            object.http.get(object.LOLRecommendIndex,function (res) {
                var html = '';
                res.on('data',function (data) {
                    html+=data
                });
                res.on('end',function () {
                    var result = object.parseRecommendIndex(html,cate);
                    solve(result);
                })
            }).on('error',function (err) {
                solve(null);
                common.handleError(err,__file,__line);
            })
        });
    }
}
recommendLOL();
//将抓取的推荐内容写入数据库
function writeRecommendDataToDb(recommendData,cate) {
    var connection = mysql.createConnection({
        host: common.host,
        user: common.user,
        password: common.password,
        database: common.databaseName,
        multipleStatements: true
    });
    connection.connect();
    var sql = 'delete from '+common.recommendTableName + ' where cate = \'' + cate +'\';' ;
    console.log(sql);
    for (var i = 1 ;i< recommendData.length;i++){
        sql += 'insert into '+common.recommendTableName +' set ';
        sql+=connection.escape(recommendData[i-1]);
        sql+=';'
    }
    connection.query(sql,function(err, rows, fields) {
        if (err) throw common.handleError(err,__file,__line);
        // console.log('查询结果为:', rows);
    });
    connection.end();
}

//GrabLOLHeros
function grab() {
    
}