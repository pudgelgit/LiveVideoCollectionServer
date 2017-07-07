"use strict";
/**
 * Created by ggwtest on 17/2/6.
 */
const http = require('http');
const https = require('https');
const promise = require('promise');
const timer = require('timers');
const common = require("./common");
const grabInterval = 100000;
const site = require("./site");
timer.setInterval(function () {
    grabFamousAnchors();
    recommend();
}, grabInterval);

//推荐项目
function recommend() {
    var sites = [site.douyu,site.panda,site.huya,site.zhanqi];
    var recommendData = [];
    let promises = [];
    for (var i=0 ; i < sites.length; i++){
        promises.push(new promise(function (resolve,reject) {
            sites[i].getRecommendData(resolve);
        }));
    }
    promise.all(promises).then(function (values) {
        console.log("then in grab");
        for (let i = 0; i < values.length; i++) {
            if (values[i] != null && values[i] != undefined) {
                recommendData = recommendData.concat(values[i]);
            }
        }

        if (recommendData.length > 0) {
            // for (let i = 0; i < recommendData.length; i++) {
            //     setInfoOfRoom(recommendData[i]);
            // }
            recommendData = recommendData.sort(function (a,b) {
                var viewNuma = a["viewNum"];
                var viewNumb = b["viewNum"];
                if (viewNuma.indexOf("万") != -1) {
                    viewNuma = parseInt(viewNuma) * 10000;
                }else {
                    viewNuma = parseInt(viewNuma);
                }
                if (viewNumb.indexOf("万") != -1) {
                    viewNumb = parseInt(viewNumb) * 10000;
                }else {
                    viewNumb = parseInt(viewNumb);
                }
                return viewNumb-viewNuma;
            });
            writeRecommendDataToDb(recommendData);
        }
        recommendData = null;
    });

    //将抓取的推荐内容写入数据库
    function writeRecommendDataToDb(recommendData) {
        var sql = 'delete from ' + common.recommendTableName + ';';
        sql += 'insert into ' + common.recommendTableName + ' (anchorName,viewNum,address,roomName,siteName,cate,position,hero,tags,appAddress) values ';
        var values = common.objectArrayToSQLValues(recommendData, ['anchorName', 'viewNum', 'address', 'roomName', 'siteName', 'cate', 'position', 'hero', 'tags',"appAddress"]);
        sql += values;
        common.sqlToDB(sql);
        values = null;
        sql = null;
    }
}

//抓取星主播
function grabFamousAnchors() {
    let sql = 'select * from ' + common.famousAnchorsTableName;
    common.sqlToDB(sql, rows => {
        if (rows != undefined) {
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                let anchor = {
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
        }
    });
}
