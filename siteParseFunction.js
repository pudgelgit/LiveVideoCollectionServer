"use strict";
/**
 * Created by ggwtest on 17/2/7.
 */
var cheerio = require('cheerio');
//斗鱼
//解析推荐页
function douyuParseRecommendIndex(htmlContent, cate) {
    var recommendData = [];
    var $ = cheerio.load(htmlContent);
    var lis = $('ul#live-list-contentbox li a');
    lis.each(function (i, elem) {
        var a = $(this);
        var anchorItem = new Object();
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
        anchorItem.site = '斗鱼';
        anchorItem.cate = cate;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
//熊猫
//解析推荐页
function (htmlContent, cate) {
    var recommendData = [];
    var $ = cheerio.load(htmlContent);
    var host = 'www.panda.tv';
    var lis = $('.video-list-item-wrap');
    lis.each(function (i, elem) {
        var a = $(this);
        var anchorItem = new Object();
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
        anchorItem.site = '熊猫';
        anchorItem.cate = cate;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
