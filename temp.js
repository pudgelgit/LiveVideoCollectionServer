/**
 * Created by ggwtest on 28/06/2017.
 */
const common = require('./common');
const http = require("http");
const cheerio = require('cheerio');
const wzry = require('./source/11.json');
const heroes = require('./source/wzryheroes.json');
console.log(heroes);
// var  heros = [];
// for (var i in wzry){
//     var temp = wzry[i];
//     var hero = {};
//     hero["name"] = temp.name;
//     hero["alias"] = [temp.name];
//     hero["displayname"] = temp.name;
//     var type = temp.hero_type;
//     switch (type){
//         case 2:
//             hero["position"] = "法师";
//             break;
//         case 3:
//             hero["posiition"] = "坦克";
//             break;
//         case 6:
//             hero["position"] = "辅助";
//             break;
//         case 5:
//             hero["position"] = "射手";
//             break;
//         case 1:
//             hero["position"]  ="战士";
//             break;
//         case 4:
//             hero.position = "刺客";
//             break;
//     }
//     heros.push(hero);
// }


// var fs = require('fs');
// fs.writeFile(__dirname+"/source/wzryheroes.json", JSON.stringify(heros), function(err) {
//     if(err) {
//         return console.log(err);
//     }
// });

