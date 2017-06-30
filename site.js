/**
 * Created by ggwtest on 13/06/2017.
 */
const http = require('http');
const https = require('https');
const siteConferenceData = require('./source/site-conference.json');
const promise = require('promise');
const timer = require('timers');
const common = require('./common');
const cheerio = require('cheerio');
const url = require('url');
const cate = require('./cate');
class Site {
    constructor(siteInfo) {
        this.recommendCates = siteInfo['recommendCates'];
        this.request = siteInfo['protocol'] == 'http' ? http : https;
        this.recommendPrefix = siteInfo['recommendPrefix'];
        this.siteName = siteInfo['siteName'];
    }
    //获取推荐列表,并调用回调
    getRecommendData(callback){
        var self = this;
        var promises = [];
        var i = 0;
        for (var cateName in this.recommendCates){
            if (this.recommendCates.hasOwnProperty(cateName)){
                var cates = this.recommendCates[cateName];
                for (var j in cates){
                    promises.push(this.promiseGetRecommend(this.recommendPrefix + this.recommendCates[cateName][j], cateName,this.siteName, i*500,this.request));
                }
                i++;
            }
        }
        promise.all(promises).then(function (values) {
            self.recommendData = [];
            for (var j = 0; j < values.length; j++) {
                if (values[j] != null && values[j] != undefined) {
                    self.recommendData = self.recommendData.concat(values[j]);
                }
            }
            for (var i in self.recommendData){
                var room = self.recommendData[i];
                self.makeupRoomInfo(room);
            }
            callback(self.recommendData);
        });

    }
    //抓取推荐主页数据
    promiseGetRecommend(urlstring, cate, siteName, dalay,request) {
        var site = this;
        var urlObj = url.parse(urlstring);
        return new promise(function (solve, reject) {
            timer.setTimeout(() => request.get(urlObj, function (res) {
                const statusCode = res.statusCode;
                if (statusCode != 200) {
                    common.handleError(new Error('status code :' + statusCode), 'request ' + siteName + ' ' + cate);
                    solve(null);
                    return;
                }
                var html = '';
                res.on('data', function (data) {
                    html += data;
                });
                res.on('end', function () {
                    try {
                        var result = site.parseRecommendHtml(html, cate);
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
            }).setTimeout(50000, () => {
                solve(null);
                common.handleError(new Error('timeout'), 'request ' + siteName + ' ' + cate);
            }), dalay);
        });
    }

    //补充房间的信息
    makeupRoomInfo(room) {
        if (room.cate == cate.liveCates.lol) {
            let roomCate = cate.lol;
            room.position = roomCate.positionMatch(room.roomName);
            if (room.position == null) {
                room.position = roomCate.positionMatch(room.anchorName);
            }

            //通过标题的包含的英雄别名或者英雄名来定位
            let hero = roomCate.heroMatch(room.roomName);
            if (hero == null) {
                hero = roomCate.heroMatch(room.anchorName);
            }
            if (room.position == null && hero != null) {
                room.position = hero.position;
            }
            if (room.hero == null && hero != null) {
                room.hero = hero.displayName;
            }
            for (let i = 0; i < common.famousAnchors.length; i++) {
                let famousAnchor = common.famousAnchors[i];
                if (room.anchorName == famousAnchor.anchorName) {
                    room.tags = famousAnchor.tags;
                    if (room.position == null)
                        room.position = famousAnchor.position;
                    if (room.hero == null)
                        room.hero = famousAnchor.hero;
                }
            }
        }else if (room.cate == cate.liveCates.ow){
            //通过标题的包含的英雄别名或者英雄名来定位
            let roomCate = cate.ow;
            let hero = roomCate.heroMatch(room.roomName);
            if (hero == null) {
                hero = roomCate.heroMatch(room.anchorName);
            }
            if (room.hero == null && hero != null) {
                room.hero = hero.displayName;
            }
        }else if (room.cate == cate.liveCates.hs){
            let roomCate = cate.hs;
            let hero = roomCate.heroMatch(room.roomName);
            if (hero == null) {
                hero = roomCate.heroMatch(room.anchorName);
            }
            if (room.hero == null && hero != null) {
                room.hero = hero.displayName;
            }
        }else if(room.cate == cate.liveCates.wzry){
            let roomCate = cate.wzry;
            room.position = roomCate.positionMatch(room.roomName);
            if (room.position == null) {
                room.position = roomCate.positionMatch(room.anchorName);
            }
            //通过标题的包含的英雄别名或者英雄名来定位
            let hero = roomCate.heroMatch(room.roomName);
            if (hero == null) {
                hero = roomCate.heroMatch(room.anchorName);
            }
            if (room.position == null && hero != null) {
                room.position = hero.position;
            }
            if (room.hero == null && hero != null) {
                room.hero = hero.displayName;
            }
        }
    }
}
class Douyu extends Site{
    parseRecommendHtml(htmlContent, cate) {
        var recommendData = [];
        var $ = cheerio.load(htmlContent);
        var host = 'm.douyu.com';
        var lis = $('ul#live-list-contentbox li a');
        var self = this;
        lis.each(function (i, elem) {
            var a = $(this);
            var anchorItem = {};
            anchorItem.roomName = a.attr('title');
            var id = a.attr('data-rid');
            var link = a.attr('href');
            let temp = url.parse(link);
            if (temp.host == null) {
                temp.protocol = 'https:';
                temp.host = host;
                link = url.format(temp);
            }
            anchorItem.address = link;
            anchorItem.anchorName = a.find('.dy-name').text();
            anchorItem.viewNum = a.find('.dy-num').text();
            anchorItem.siteName = self.siteName;
            anchorItem.cate = cate;
            anchorItem.position = null;
            anchorItem.hero = null;
            anchorItem.tags = null;
            anchorItem.appAddress = "douyutv://"+id+"&undefined";
            recommendData.push(anchorItem);
        });
        return recommendData;
    }
}

class Panda extends Site{
    parseRecommendHtml(htmlContent, cate) {
        let recommendData = [];
        let $ = cheerio.load(htmlContent);
        let host = 'm.panda.tv';
        let lis = $('.video-list-item-wrap');
        var self = this;
        lis.each(function (i, elem) {
            let a = $(this);
            let anchorItem = {};
            anchorItem.roomName = a.find('.video-title').text();
            let link = a.attr('href');
            let id = a.attr("data-id");
            let temp = url.parse(link);
            if (temp.host == null) {
                temp.protocol = 'https:';
                temp.host = host;
                link = url.format(temp);
            }
            anchorItem.address = link;
            anchorItem.anchorName = a.find('.video-nickname').text();
            anchorItem.viewNum = a.find('.video-number').text();
            if (anchorItem.viewNum > 10000){
                var nn = parseInt(anchorItem.viewNum )/10000;
                nn = parseInt(nn);
                anchorItem.viewNum = nn + "万";
            }
            anchorItem.siteName = self.siteName;
            anchorItem.cate = cate;
            anchorItem.position = null;
            anchorItem.hero = null;
            anchorItem.tags = null;
            anchorItem.appAddress = "https://m.gate.panda.tv/openroom/"+id;
            recommendData.push(anchorItem);
        });
        return recommendData;
    }
}

class Zhanqi extends Site{

    parseRecommendHtml(htmlContent,cate){
        let host = "m.zhanqi.tv";
        let recommendData = [];
        var json = JSON.parse(htmlContent);
        var rooms = json["data"]["rooms"];

        var self = this;
        if (rooms != undefined && rooms.length > 0) {
            for (var i in rooms){
                var room = rooms[i];
                let anchorItem = {};
                anchorItem.roomName = room["title"];
                let link = room["code"];

                        let temp = url.parse(link);
                        if (temp.host == null) {
                            temp.protocol = 'https:';
                            temp.host = host;
                            link = url.format(temp);
                        }
                anchorItem.address = link;
                anchorItem.anchorName = room["nickname"];
                anchorItem.viewNum = room["online"];
                anchorItem.siteName = self.siteName;
                anchorItem.cate = cate;
                anchorItem.position = null;
                anchorItem.hero = null;
                anchorItem.tags = null;
                let id = room["id"];
                let subID = room["uid"];
                // anchorItem.appAddress = "https://m.zhanqi.tv/app.php?roomid="+room["code"];
                recommendData.push(anchorItem);
            }
        }
        return recommendData;
    }
}

class Huya extends Site{
    parseRecommendHtml(htmlContent,cate){
        let recommendData = [];
        let $ = cheerio.load(htmlContent);
        let host = 'www.huya.com';
        let lis = $(".game-live-item");
        var self = this;
        lis.each(function (i, elem) {
            let a = $(this);
            let anchorItem = {};
            anchorItem.roomName = a.find('a.title.new-clickstat').attr('title');
            let link = a.find('a.video-info.new-clickstat').attr('href');
            let temp = url.parse(link);
            if (temp.host == null) {
                temp.protocol = 'http:';
                temp.host = host;
                link = url.format(temp);
            }
            anchorItem.address = link;
            anchorItem.anchorName = a.find('.nick').text();
            anchorItem.viewNum = a.find('.js-num').text();
            anchorItem.siteName = self.siteName;
            anchorItem.cate = cate;
            anchorItem.position = null;
            anchorItem.hero = null;
            anchorItem.tags = null;
            anchorItem.appAddress = null;
            recommendData.push(anchorItem);
        });
        return recommendData;
    }
}

const sites = siteConferenceData.sites;
const douyu = new Douyu(sites[0]);
const panda = new Panda(sites[1]);
const huya = new Huya(sites[2]);
const zhanqi = new Zhanqi(sites[3]);
exports.douyu = douyu;
exports.panda = panda;
exports.huya = huya;
exports.zhanqi = zhanqi;