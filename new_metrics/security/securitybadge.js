
const fs = require('fs');
const exec = require('child_process').exec;
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");

const filePathCurrentBugs = path.resolve(__dirname, "./numberofbugs.txt");
const filePathPrevBugs = path.resolve(__dirname, "./numberofbugs.txt");
const dbpath = path.resolve(__dirname, "./bugs.db");

const security_db = new sqlite3.Database(dbpath);

module.exports = (req,res) => {

    // because the libary updates via bash script, the update of the stat itself will have to be seperate from badge presentation
    return new Promise((resolve, reject) => {

        let name = req.query.libname;
        security_db.get(`SELECT numberofbugs, status FROM bugs WHERE libname = "${name}"`, (err, result) => {
            if (err){
                console.log(err);
                return reject(err);
            }
            console.log(result);
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
