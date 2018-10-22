
var fs = require('fs');
var exec = require('child_process').exec;
var path = require("path");

const filePathCurrentBugs = path.resolve(__dirname, "./numberofbugs.txt");
const filePathPrevBugs = path.resolve(__dirname, "./numberofbugs.txt");

module.exports = function(req,res){

    return new Promise((resolve, reject) => {
        // due to Github request cache limits, badge would only be updated once per day
        // running the shell script to update is slow 
        exec("bash updatestats.sh",  {cwd: './new_metrics/security'}, function(err,stdout,stderr) {
            if (err){
                console.log(err);
                return reject(err.code);
            }

            const numberofbugs = fs.readFileSync(filePathCurrentBugs, 'utf8');
            const previousbugs = fs.readFileSync(filePathPrevBugs,'utf8');

            let bugString = "";
            if (previousbugs.length == 0 || previousbugs == numberofbugs){
                bugString = numberofbugs.concat(" ", "--");
            }
            else if(previousbugs < numberofbugs){
                bugString = numberofbugs.concat(" ", "↑");
            }
            else{
                bugString = numberofbugs.concat(" ", "↓");
            }

            return resolve(bugString);
        });
    });

    // run sqlite3 to grab latest data for badge 
};
