
const fs = require('fs');
const exec = require('child_process').exec;
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");

const filePathCurrentBugs = path.resolve(__dirname, "./numberofbugs.txt");
const filePathPrevBugs = path.resolve(__dirname, "./numberofbugs.txt");
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
                return reject("No results found for this Java library");
            }
            return resolve(result);
        });


        // due to Github request cache limits, badge would only be updated once per day
        // running the shell script to update is slow 

        // exec("bash updatestats.sh",  {cwd: './new_metrics/security'}, function(err,stdout,stderr) {
        //     if (err){
        //         console.log(err);
        //         console.log(err);
        //     }

        //     const numberofbugs = fs.readFileSync(filePathCurrentBugs, 'utf8');
        //     const previousbugs = fs.readFileSync(filePathPrevBugs,'utf8');
    
        //     let bugString = "";
        //     if (previousbugs.length == 0 || previousbugs == numberofbugs){
        //         bugString = numberofbugs.concat(" ", "--");
        //     }
        //     else if(previousbugs < numberofbugs){
        //         bugString = numberofbugs.concat(" ", "↑");
        //     }
        //     else{
        //         bugString = numberofbugs.concat(" ", "↓");
        //     }
    
        //     return resolve(bugString);
        // });

    });

};
