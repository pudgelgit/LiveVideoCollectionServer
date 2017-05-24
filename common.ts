/**
 * Created by ggwtest on 16/11/17.
 */
import cheerio = require('cheerio');
import url = require('url');
import mysql = require('mysql');
export enum Position{
    //LOL
    Top="上单",
    Jungle='野',
    Mid='中单',
    ADC='AD',
    Support='辅助'
}
export enum LiveCate{
    lol='lol',
    hs='hs',
    dota2='dota2',
    ow = 'ow',
    othergame = 'othergame'
}
export enum Site{
    douyu='斗鱼',
    panda='熊猫',
    zhanqi='战旗',
    huya='虎牙'
}
export interface Room{
    roomName:string,
    site:string,
    anchorName:string,
    address:string
    cate:LiveCate,
    viewNum:string
    position:Position,
    tags:string,
    hero:string
}

export interface Anchor{
    anchorName:string,
    tags:string,
    site:Site,
    cate:LiveCate,
    roomID:string,
    position:string,
    hero:string
}

export interface Hero{
    name:string,
    position:Position,
    alias:[string],
    shownName:string
}
//错误处理机制
export function handleError(error: Error ,when:string) {
    console.log('error:'+error.message+' occur when:'+when);
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
//解析各个网站的推荐列表
export function pandaParseRecommend(htmlContent:string,cate:LiveCate) {
    let  recommendData = [];
    let $ = cheerio.load(htmlContent);
    let host = 'www.panda.tv';
    let lis = $('.video-list-item-wrap');
    lis.each(function (i,elem) {
        let a = $(this);
        let anchorItem : Room={};
        anchorItem.roomName = a.find('.video-title').text();
        let link = a.attr('href');
        let temp = url.parse(link);
        if (temp.host == null){
            temp.protocol = 'http:';
            temp.host = host;
            temp.hostname = host;
            link = url.format(temp);
        }
        anchorItem.address = link;
        anchorItem.anchorName = a.find('.video-nickname').text();
        anchorItem.viewNum = a.find('.video-number').text();
        anchorItem.siteName= Site.panda;
        anchorItem.cate = cate;
        anchorItem.position = null;
        anchorItem.hero = null;
        anchorItem.tags = null;
        recommendData.push(anchorItem);
    });
    return recommendData;
}
export function douyuParseRecommend(htmlContent:string,cate:LiveCate) {
    let recommendData = [];
    let $ = cheerio.load(htmlContent);
    let host = 'www.douyu.com';
    let lis = $('ul#live-list-contentbox li a');
    lis.each(function (i,elem) {
        let a = $(this);
        let anchorItem : Room={};
        anchorItem.roomName = a.attr('title');
        let link = a.attr('href');
        let temp = url.parse(link);
        if (temp.host == null){
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
export function zhanqiParseRecommend(htmlContent:string,cate:LiveCate) {
    let recommendData = [];
    let $ = cheerio.load(htmlContent);
    let host = 'www.zhanqi.tv';
    let lis = $("ul.clearfix.js-room-list-ul li");
    lis.each(function (i,elem) {
        let a = $(this);
        let anchorItem : Room={};
        anchorItem.roomName = a.find('span.name').text();
        let link = a.find('a.js-jump-link').attr('href');
        let temp = url.parse(link);
        if (temp.host == null){
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
export function huyaParseRecommend(htmlContent:string,cate:LiveCate){
    let recommendData = [];
    let $ = cheerio.load(htmlContent);
    let host = 'www.huya.com';
    let lis = $(".game-live-item");
    lis.each(function (i,elem) {
        let a = $(this);
        let anchorItem : Room={};
        anchorItem.roomName = a.find('a.title.new-clickstat').attr('title');
        let link = a.find('a.video-info.new-clickstat').attr('href');
        let temp = url.parse(link);
        if (temp.host == null){
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

export function sqlToDB(sql,callback ?: Function){
    connection.query(sql,function(err, rows, fields) {
        if (err) handleError(err);
        // console.log('查询结果为:', rows);
        if (callback){
            callback(rows);
        }
    });
}
//把object转成SQL的string
export function objectArrayToSQLValues(object : Object, columns : [string]){
    let values = '';

    for(let i = 0;i< object.length;i++){
        values+='('
        for (let j =0 ;j < columns.length-1 ; j++){
            values+=connection.escape(object[i][columns[j]])+','
        }
        values+=connection.escape(object[i][columns[columns.length-1]]);
        values+='),';
    }
    values = values.substr(0,values.length-1);
    return values;
}

export let heroList:[] = [];
//database info
export let host = 'localhost';
export let user = 'root';
export let password = '';
export let databaseName = 'LiveVideoCollection';
export let recommendTableName = 'recommend_anchors';
export let famousAnchorsTableName = 'famous_anchors';
export let famousAnchors : [Anchor]=[];
export let errorTableName = 'errors';
//
let connection:mysql.Socket = mysql.createConnection({
    port:3306,
    host: host,
    user: user,
    password: password,
    database: databaseName,
    multipleStatements: true
});
connection.connect();