"use strict";
/**
 * Created by ggwtest on 16/11/17.
 */
const cheerio = require('cheerio');
const url = require('url');
const mysql = require('mysql');

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

function sqlToDB(sql, callback) {
    pool.query(sql, function (err, rows, fields) {
        if (err)
            handleError(err, 'sqlToDB');
        // console.log('查询结果为:', rows);
        console.log('query success');
        if (callback) {
            callback(rows);
        }
    });
    // connection.destroy();
}

//把object转成SQL的string
function objectArrayToSQLValues(object, columns) {
    let values = '';
    for (let i = 0; i < object.length; i++) {
        values += '(';
        for (let j = 0; j < columns.length - 1; j++) {
            values += mysql.escape(object[i][columns[j]]) + ',';
        }
        values += mysql.escape(object[i][columns[columns.length - 1]]);
        values += '),';
    }
    values = values.substr(0, values.length - 1);
    // console.log(values.substring(0,1000));
    return values;
}

//
function saveToFile(content,fileName) {
    var fs = require('fs');
    fs.writeFile(__dirname+"/temp/"+fileName, content, function(err) {
        if(err) {
            return console.log(err);
        }
    });
}
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
exports.saveToFile = saveToFile;
exports.handleError = handleError;
exports.objectArrayToSQLValues = objectArrayToSQLValues;
exports.sqlToDB = sqlToDB;
const pool  = mysql.createPool({
    connectionLimit : 10,
    port: 3306,
    host: exports.host,
    user: exports.user,
    password: exports.password,
    database: exports.databaseName,
    multipleStatements: true
});
exports.pool = pool;

