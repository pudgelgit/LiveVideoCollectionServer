"use strict";
/**
 * Created by ggwtest on 16/11/17.
 */
var cheerio = require('cheerio');
var url = require('url');
var mysql = require('mysql');
(function (Position) {
    //LOL
    Position[Position["Top"] = "上单"] = "Top";
    Position[Position["Jungle"] = '野'] = "Jungle";
    Position[Position["Mid"] = '中单'] = "Mid";
    Position[Position["ADC"] = 'AD'] = "ADC";
    Position[Position["Support"] = '辅助'] = "Support";
})(exports.Position || (exports.Position = {}));
var Position = exports.Position;
(function (LiveCate) {
    LiveCate[LiveCate["lol"] = 'lol'] = "lol";
    LiveCate[LiveCate["hs"] = 'hs'] = "hs";
    LiveCate[LiveCate["dota2"] = 'dota2'] = "dota2";
    LiveCate[LiveCate["ow"] = 'ow'] = "ow";
    LiveCate[LiveCate["othergame"] = 'othergame'] = "othergame";
})(exports.LiveCate || (exports.LiveCate = {}));
var LiveCate = exports.LiveCate;
(function (Site) {
    Site[Site["douyu"] = '斗鱼'] = "douyu";
    Site[Site["panda"] = '熊猫'] = "panda";
    Site[Site["zhanqi"] = '战旗'] = "zhanqi";
    Site[Site["huya"] = '虎牙'] = "huya";
})(exports.Site || (exports.Site = {}));
var Site = exports.Site;
//错误处理机制
function handleError(error, when) {
    console.log('error:' + error.message + ' occur when:' + when);
    //TODO:错误处理,把错误传到数据库的errors表格
    // sqlToDB('select * from '+errorTableName,rows=>{
    //     for (let i = 0;i<rows.length;i++){
    //         let row = rows[i];
    //         if (when == row.message + row.situation){
    //             let sql = 'UPDATE '+errorTableName+' SET count='+(++row.count)+' WHERE message = '+row.message + ' '
    //         }
    //     }
    // })
}
exports.handleError = handleError;
//解析各个网站的推荐列表
function pandaParseRecommend(htmlContent, cate) {
    var recommendData = [];
    var $ = cheerio.load(htmlContent);
    var host = 'www.panda.tv';
    var lis = $('.video-list-item-wrap');
    lis.each(function (i, elem) {
        var a = $(this);
        var anchorItem = {};
        anchorItem.roomName = a.find('.video-title').text();
        var link = a.attr('href');
        var temp = url.parse(link);
        if (temp.host == null) {
            temp.protocol = 'http:';
            temp.host = host;
            temp.hostname = host;
            link = url.format(temp);
        }
        anchorItem.address = link;
        anchorItem.anchorName = a.find('.video-nickname').text();
        anchorItem.viewNum = a.find('.video-number').text();
        anchorItem.siteName = Site.panda;
        anchorItem.cate = cate;
        anchorItem.position = null;
        anchorItem.hero = null;
        anchorItem.tags = null;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
exports.pandaParseRecommend = pandaParseRecommend;
function douyuParseRecommend(htmlContent, cate) {
    var recommendData = [];
    var $ = cheerio.load(htmlContent);
    var host = 'www.douyu.com';
    var lis = $('ul#live-list-contentbox li a');
    lis.each(function (i, elem) {
        var a = $(this);
        var anchorItem = {};
        anchorItem.roomName = a.attr('title');
        var link = a.attr('href');
        var temp = url.parse(link);
        if (temp.host == null) {
            temp.protocol = 'https:';
            temp.host = host;
            temp.hostname = host;
            link = url.format(temp);
        }
        anchorItem.address = link;
        anchorItem.anchorName = a.find('.dy-name').text();
        anchorItem.viewNum = a.find('.dy-num').text();
        anchorItem.siteName = '斗鱼';
        anchorItem.cate = cate;
        anchorItem.position = null;
        anchorItem.hero = null;
        anchorItem.tags = null;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
exports.douyuParseRecommend = douyuParseRecommend;
function zhanqiParseRecommend(htmlContent, cate) {
    var recommendData = [];
    var $ = cheerio.load(htmlContent);
    var host = 'www.zhanqi.tv';
    var lis = $("ul.clearfix.js-room-list-ul li");
    lis.each(function (i, elem) {
        var a = $(this);
        var anchorItem = {};
        anchorItem.roomName = a.find('span.name').text();
        var link = a.find('a.js-jump-link').attr('href');
        var temp = url.parse(link);
        if (temp.host == null) {
            temp.protocol = 'https:';
            temp.host = host;
            temp.hostname = host;
            link = url.format(temp);
        }
        anchorItem.address = link;
        anchorItem.anchorName = a.find('span.anchor.anchor-to-cut.dv').text();
        anchorItem.viewNum = a.find('span.views span.dv').text();
        anchorItem.siteName = '战旗';
        anchorItem.cate = cate;
        anchorItem.position = null;
        anchorItem.hero = null;
        anchorItem.tags = null;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
exports.zhanqiParseRecommend = zhanqiParseRecommend;
function huyaParseRecommend(htmlContent, cate) {
    var recommendData = [];
    var $ = cheerio.load(htmlContent);
    var host = 'www.huya.com';
    var lis = $(".game-live-item");
    lis.each(function (i, elem) {
        var a = $(this);
        var anchorItem = {};
        anchorItem.roomName = a.find('a.title.new-clickstat').attr('title');
        var link = a.find('a.video-info.new-clickstat').attr('href');
        var temp = url.parse(link);
        if (temp.host == null) {
            temp.protocol = 'http:';
            temp.host = host;
            temp.hostname = host;
            link = url.format(temp);
        }
        anchorItem.address = link;
        anchorItem.anchorName = a.find('.nick').text();
        anchorItem.viewNum = a.find('.js-num').text();
        anchorItem.siteName = '虎牙';
        anchorItem.cate = cate;
        anchorItem.position = null;
        anchorItem.hero = null;
        anchorItem.tags = null;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
exports.huyaParseRecommend = huyaParseRecommend;
function sqlToDB(sql, callback) {
    connection.query(sql, function (err, rows, fields) {
        if (err)
            handleError(err, 'sqlToDB');
        // console.log('查询结果为:', rows);
        if (callback) {
            callback(rows);
        }
    });
}
exports.sqlToDB = sqlToDB;
//把object转成SQL的string
function objectArrayToSQLValues(object, columns) {
    var values = '';
    for (var i = 0; i < object.length; i++) {
        values += '(';
        for (var j = 0; j < columns.length - 1; j++) {
            values += connection.escape(object[i][columns[j]]) + ',';
        }
        values += connection.escape(object[i][columns[columns.length - 1]]);
        values += '),';
    }
    values = values.substr(0, values.length - 1);
    return values;
}
exports.objectArrayToSQLValues = objectArrayToSQLValues;
exports.heroList = [];
//database info
exports.host = 'localhost';
exports.user = 'root';
exports.password = '6731909';
exports.databaseName = 'LiveVideoCollection';
exports.recommendTableName = 'recommend_anchors';
exports.famousAnchorsTableName = 'famous_anchors';
exports.famousAnchors = [];
exports.errorTableName = 'errors';
//
var connection = mysql.createConnection({
    port: 3306,
    host: exports.host,
    user: exports.user,
    password: exports.password,
    database: exports.databaseName,
    multipleStatements: true
});
connection.connect();
