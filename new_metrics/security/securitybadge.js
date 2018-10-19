
var fs = require('fs');
var exec = require('child_process').exec;
var path = require("path");

module.exports = function(req,res){

    return new Promise((resolve, reject) => {
        exec("bash updatestats.sh",  {cwd: './new_metrics/security'}, function(err,stdout,stderr) {
            if (err){
                console.log(err);
                return reject(err.code);
            }

            // console.log(stdout);
            // console.log(stderr);

            fs.readFile('numberofbugs.txt', 'utf8', function(err, contents) {
                console.log(contents);
                return resolve(contents);
            });
        });
    });
};
