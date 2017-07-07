/**
 * Created by ggwtest on 15/06/2017.
 */
const lolheroes = require("./source/lolheroes");
const owheroes = require("./source/owheroes.json");
class Cate {
    constructor(){
    }
    heroMatch(content){
        var lowerContent = content.toLowerCase();
        for (var key in this.heroes){
            var hero =  this.heroes[key];
            var alias = hero["alias"];
            for (var j =0 ; j < alias.length ; j++){
                var index = lowerContent.indexOf(alias[j].toLowerCase());
                if (index > -1) {
                    return hero;
                }
            }
        }
        return null;
    }
    positionMatch(content){
        var lowerContent = content.toLowerCase();
        var position = null;
        for (var key in this.positions){
            var currentPosition =  this.positions[key];
            var alias = currentPosition["alias"];
            for (var j =0 ; j < alias.length ; j++){
                var index = lowerContent.indexOf(alias[j].toLowerCase());
                if (index > -1) {
                    position = currentPosition["displayName"];
                }
            }
        }
        return position;
    }
}
class LOL extends Cate{
    constructor(){
        super();
        // this.positions = Object.freeze({"Top":"上单","Jungle":"野","Mid":"中单","ADC":"AD","Support":"辅助"});
        this.positions = Object.freeze({
            "上单":{"alias":["上单"],"displayName":"上单"},
            "打野":{"alias":["野"],"displayName":"打野"},
            "中单":{"alias":["中"],"displayName":"中单"},
            "ADC":{"alias":["AD"],"displayName":"ADC"},
            "辅助":{"alias":["辅助"],"displayName":"辅助"},
        });
        this.heroes = lolheroes;
    }

}
class HS extends Cate{
    constructor(){
        super();
        this.heroes = Object.freeze({
            "法师" : {"alias":["法"] ,"displayName": "法师"},
            "猎人" : {"alias":["猎"] , "displayName" : "猎人"},
            "骑士" : {"alias":["骑"],"displayName":"骑士"},
            "战士" :{"alias":["战"],"displayName":"战士"},
            "德鲁伊" : {"alias":["德"],"displayName":"德鲁伊"},
            "术士" : {"alias":["术"],"displayName":"术士"},
            "萨尔" : {"alias":["萨"],"displayName":"萨尔"},
            "牧师" : {"alias":["牧"],"displayName":"牧师"},
            "盗贼" : {"alias":["贼"],"displayName":"盗贼"}
        });
    }
}
class OW extends Cate{
    constructor(){
        super();
        this.heroes = owheroes;
    }
}
class Dota2 extends Cate{
    constructor(){
        super();
        this.heroes = Object.freeze({
            "Jaina" : {"alias":["法"] ,"showName": "法师"},
        });
    }
}
class OtherGame extends Cate{
    constructor(){
        super();
        this.heroes = Object.freeze({
            "Jaina" : {"alias":["法"] ,"showName": "法师"},
        });
    }
}
class WZRY extends Cate{
    constructor(){
        super();
        this.heroes = require("./source/wzryheroes.json");
        this.positions = Object.freeze({
            "坦克" : {"alias":["坦"] ,"displayName": "坦克"},
            "战士" : {"alias":["战"] ,"displayName": "战士"},
            "刺客" : {"alias":["刺客"] ,"displayName": "刺客"},
            "法师" : {"alias":["法师","法王"] ,"displayName": "法师"},
            "射手" : {"alias":["射手"] ,"displayName": "射手"},
            "辅助" : {"alias":["辅助"] ,"displayName": "辅助"}
        });
    }

}
const LiveCates = Object.freeze({
    "lol":"lol",
    "hs":"hs",
    "dota2":"dota2",
    "ow":"ow",
    "otherGame":"othergame",
    "wzry":"wzry"
});
const lol = new LOL();
const ow = new OW();
const hs = new HS();
const dota2 = new Dota2();
const otherGame = new OtherGame();
const wzry = new WZRY();
exports.lol = lol;
exports.ow = ow;
exports.hs = hs;
exports.dota2 = dota2;
exports.otherGame = otherGame;
exports.liveCates = LiveCates;
exports.wzry = wzry;
