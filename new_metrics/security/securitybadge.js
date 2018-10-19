
var fs = require('fs');
var exec = require('child_process').exec;
var path = require("path");

const filePath = path.resolve(__dirname, "./numberofbugs.txt");

module.exports = function(req,res){

    return new Promise((resolve, reject) => {
        // due to Github request cache limits, badge would only be updated once per day
        // running the shell script to update is slow 
        exec("bash updatestats.sh",  {cwd: './new_metrics/security'}, function(err,stdout,stderr) {
            if (err){
                console.log(err);
                return reject(err.code);
            }

            const numberofbugs = fs.readFileSync(filePath, 'utf8');
            return resolve(numberofbugs);
        });
    });
};
