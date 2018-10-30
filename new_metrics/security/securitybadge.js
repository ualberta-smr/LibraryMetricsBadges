
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const dbpath = path.resolve(__dirname, "../../badges.db");

const db = new sqlite3.Database(dbpath);

module.exports = (req,res) => {
    return new Promise((resolve, reject) => {
        let name = req.query.libname;
        db.get(`SELECT numberofbugs, status FROM bugs WHERE libname = "${name}"`, (err, result) => {
            if (err){
                console.log(err);
                return reject(err);
            }
            if (typeof result == "undefined"){
                return reject("No results found for this Java library. Did you add your library to repositories.txt and run setup.sh?");
            }
            return resolve(result);
        });
    });
};
