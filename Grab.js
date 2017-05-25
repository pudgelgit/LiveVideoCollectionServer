"use strict";
/**
 * Created by ggwtest on 17/2/6.
 */
var http = require('http');
var https = require('https');
var common = require('./common');
var Promise = require('./node_modules/promise/index.js');
var timer = require('timers');
var siteConferenceData = require('./site-conference.json');
timer.setInterval(function () {
    common.sqlToDB('SELECT * FROM `lolheros`', function (result) {
        if (!result) {
            for (var i = 0; i < result.length; i++) {
                var hero = { name: result[i].name, position: result[i].position, shownName: result[i].shownName };
                var alias_1 = result[i].alias.split(',');
                hero.alias = alias_1;
                common.heroList.push(hero);
            }
        }
    });
    grabFamousAnchors();
    recommend();
}, 100000);
//LOL推荐项目
function recommend() {
    var recommendData = [];
    var sites = siteConferenceData.sites;
    var promises = [];
    for (var _i = 0, sites_1 = sites; _i < sites_1.length; _i++) {
        var site = sites_1[_i];
        var cates = site.recommendCates;
        var request = site.protocol == 'http' ? http : https;
        var prefix = site.recommendPrefix;
        var i = 0;
        for (var cateName in cates) {
            promises.push(promiseGetRecommendIndex(prefix + cates[cateName], cateName, site.siteName, request, i));
            i++;
        }
    }
    Promise.all(promises).then(function (values) {
        for (var i = 0; i < values.length; i++) {
            if (values[i] != null) {
                recommendData = recommendData.concat(values[i]);
            }
        }
        if (recommendData.length > 0) {
            for (var i = 0; i < recommendData.length; i++) {
                setInfoOfRoom(recommendData[i]);
            }
            writeRecommendDataToDb(recommendData);
        }
    });
    //抓取推荐主页数据
    function promiseGetRecommendIndex(url, cate, siteName, request, index) {
        return new Promise(function (solve, reject) {
            timer.setTimeout(function () { return request.get(url, function (res) {
                var statusCode = res.statusCode;
                if (statusCode != 200) {
                    common.handleError(new Error('status code :' + statusCode), 'request ' + siteName + ' ' + cate);
                    res.resume();
                    solve(null);
                    return;
                }
                var html = '';
                res.on('data', function (data) {
                    html += data;
                });
                res.on('end', function () {
                    try {
                        var result = null;
                        switch (siteName) {
                            case "斗鱼":
                                result = common.douyuParseRecommend(html, cate);
                                break;
                            case "熊猫":
                                result = common.pandaParseRecommend(html, cate);
                                break;
                            case "战旗":
                                result = common.zhanqiParseRecommend(html, cate);
                                break;
                            case "虎牙":
                                result = common.huyaParseRecommend(html, cate);
                                break;
                            default:
                        }
                        console.log('success to parse:' + siteName + ' ' + cate);
                        solve(result);
                    }
                    catch (e) {
                        common.handleError(e, 'parse ' + siteName + ' ' + cate);
                        solve(null);
                    }
                });
            }).on('error', function (err) {
                solve(null);
                common.handleError(err, 'request ' + siteName + ' ' + cate);
            }).setTimeout(50000, function () {
                solve(null);
                common.handleError(new Error('timeout'), 'request ' + siteName + ' ' + cate);
            }); }, 500 * index);
        });
    }
    //将抓取的推荐内容写入数据库
    function writeRecommendDataToDb(recommendData) {
        var sql = 'delete from ' + common.recommendTableName + ';';
        sql += 'insert into ' + common.recommendTableName + ' (anchorName,viewNum,address,roomName,siteName,cate,position,hero,tags) values ';
        var values = common.objectArrayToSQLValues(recommendData, ['anchorName', 'viewNum', 'address', 'roomName', 'siteName', 'cate', 'position', 'hero', 'tags']);
        sql += values;
        console.log('will write recommendData');
        common.sqlToDB(sql);
    }
}
//设置房间的位置信息
function setInfoOfRoom(room) {
    if (room.cate == common.LiveCate.lol) {
        room.position = null;
        var positions = [common.Position.ADC, common.Position.Jungle, common.Position.Mid, common.Position.Support, common.Position.Top];
        var roomName = room.roomName.toUpperCase();
        for (var x = 0; x < positions.length; x++) {
            if (roomName.indexOf(positions[x]) > -1) {
                room.position = positions[x];
            }
            else if (room.anchorName.toUpperCase().indexOf(positions[x]) > -1) {
                room.position = positions[x];
            }
        }
        //通过标题的包含的英雄别名或者英雄名来定位
        var hero = heroMatch(room.roomName);
        if (hero == null) {
            hero = heroMatch(room.anchorName);
        }
        if (room.position == null && hero != null) {
            room.position = hero.position;
        }
        if (room.hero == null && hero != null) {
            room.hero = hero.shownName;
        }
        for (var i = 0; i < common.famousAnchors.length; i++) {
            var famousAnchor = common.famousAnchors[i];
            if (room.anchorName == famousAnchor.anchorName) {
                room.tags = famousAnchor.tags;
                if (room.position == null)
                    room.position = famousAnchor.position;
                if (room.hero == null)
                    room.hero = famousAnchor.hero;
            }
        }
        //手动设置一些乱起标题的主播的信息
        if (room.anchorName == '是深海魚嗎') {
            room.position = common.Position.ADC;
        }
    }
}
//根据字符匹配相应的英雄
function heroMatch(title) {
    for (var i = 0; i < common.heroList.length; i++) {
        var hero = common.heroList[i];
        var heroNames = hero.alias;
        heroNames.push(hero.name);
        for (var j = 0; j < heroNames.length; j++) {
            var name_1 = heroNames[j];
            var index = title.indexOf(name_1);
            if (index > -1) {
                return hero;
            }
        }
    }
    return null;
}
//抓取星主播
function grabFamousAnchors() {
    var sql = 'select * from ' + common.famousAnchorsTableName;
    common.sqlToDB(sql, function (rows) {
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var anchor = {
                anchorName: row.anchorName,
                tags: row.tags,
                site: row.site,
                cate: row.cate,
                roomID: row.roomID,
                position: row.position,
                hero: row.hero
            };
            common.famousAnchors.push(anchor);
        }
    });
}
//从官网页面解析英雄列表
// function grabLOLHeros(){
//     let lolHeroSite = './source/heros.htm';
//     fs.readFile(lolHeroSite,(err,data)=>{
//         let content = iconv.decode(data,'gbk');
//         parseHeros(content);
//     });
//
//     let lolheros = [];
//
//     function parseHeros(htmlContent){
//         let $ = cheerio.load(htmlContent);
//         let lis = $("ul#jSearchHeroDiv li a");
//         lis.each(function (i,ele) {
//             let a = $(this);
//             let title = a.attr('title');
//             let alias = title.split(' ')[0];
//             let name = title.split(' ')[1];
//             lolheros.push({name:name,alias:alias,position:'上单'})
//         });
//         let sql = 'delete from '+common.lolherosTableName +';' ;
//         sql += 'insert into '+common.lolherosTableName + ' (name,position,alias) values ';
//         let values = common.objectArrayToSQLValues(lolheros,['name','position','alias']);
//         sql+=values;
//         console.log(sql);
//         common.sqlToDB(sql);
//     }
// } 
