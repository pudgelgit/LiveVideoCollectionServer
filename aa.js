/**
 * Created by ggwtest on 16/11/17.
 */
function  handleError(error,file,line) {
    console.log(error+file+line);
}
//panda一些常量
var pandaCatePrefix = "http://www.panda.tv/cate/";
var pandaLOLRecommendSite= pandaCatePrefix+'lol';
var pandaOWRecommendSite = pandaCatePrefix+'overwatch';
var pandaHSRecommendSite = pandaCatePrefix+'hearthstone';
var pandaDOTA2RecommendSite =pandaCatePrefix+'dota2';
var pandaTVGameRecommendSite = pandaCatePrefix+'zhuji';
//斗鱼一些常量
var douyuCatePrefix = 'https://www.douyu.com/directory/game/';
var douyuLOLRecommendSite=douyuCatePrefix + 'LOL';
var douyuOWRecommendSite=douyuCatePrefix+'Overwatch';
var douyuHSRecommendSite=douyuCatePrefix+'How';
var douyuDOTA2RecommendSite=douyuCatePrefix+'DOTA2';
var douyuTVGameRecommendSite =douyuCatePrefix+'TVgame';

//
var cate_lol = 'lol';
var cate_ow = 'ow';
var cate_dota2 = 'dota2';
var cate_hs = 'hs';
var cate_tvagme = 'tvgame';
var host = 'localhost';
var user = 'root';
var password = '';
var databaseName = 'LiveStreamingAssistant';
var recommendTableName = 'recommend_anchors';

var mysql = require('mysql');


exports.handleError = handleError;
exports.pandaLOLRecommend = pandaLOLRecommendSite;
exports.pandaOWRecommend = pandaOWRecommendSite;
exports.pandaHSRecommend = pandaHSRecommendSite;
exports.pandaDOTA2Recommend = pandaDOTA2RecommendSite;
exports.pandaTVGameRecommend = pandaTVGameRecommendSite;
exports.douyuLOLRecommend = douyuLOLRecommendSite;
exports.douyuOWRecommend = douyuOWRecommendSite;
exports.douyuHSRecommend = douyuHSRecommendSite;
exports.douyuDOTA2Recommend = douyuDOTA2RecommendSite;
exports.douyuTVGameRecommendSite = douyuTVGameRecommendSite;
exports.cateLOL = cate_lol;
exports.cateOw = cate_ow;
exports.cateDota2 = cate_dota2;
exports.cate_hs = cate_hs;
exports.cate_tvgame = cate_tvagme;
exports.host = host;
exports.user = 'user';
exports.password = 'password';
exports.databaseName = databaseName;
exports.recommendTableName = recommendTableName;