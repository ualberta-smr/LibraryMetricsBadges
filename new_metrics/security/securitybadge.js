const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const dbpath = path.resolve(__dirname, "../../badges.db");

const db = new sqlite3.Database(dbpath);

/**
 * GET request to grab the number of bugs detected by Spotbugs with FindSecBugs plugin from database
 * 
 * @param {object} req Express middleware request object
 * 
 * @returns {object} contains the number of bugs found from Spotbugs and the status of the query
 */
module.exports = (req) => {
    return new Promise((resolve, reject) => {
        let name = req.query.libname;
        if (typeof name === "undefined"){
            return reject("Query parameters are invalid");
        }
        db.get(`SELECT numberofbugs, status FROM bugs WHERE libname = "${name}"`, (err, result) => {
            if (err){
                console.log(err);
                return reject(err);
            }
            if (typeof result === "undefined"){
                return reject("No results found for this Java library. Did you add your library to repositories.txt and run setup.sh?");
            }
            return resolve(result);
        });
    });
};
