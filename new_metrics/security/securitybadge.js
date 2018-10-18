
var fs = require('fs');
var exec = require('child_process').exec;
var path = require("path");

module.exports = async function(req,res){

    return await new Promise((resolve, reject) => {
        // TODO fix directory paths so that the bash command can run
        exec("bash ./new_metrics/security/updatestats.sh",  {cwd: './new_metrics/security'}, function(err,stdout,stderr) {
            if (err){
                console.log(err);
                return reject(err.code);
            }

            console.log(stdout);
            console.log(stderr);

            fs.readFile('numberofbugs.txt', 'utf8', function(err, contents) {
                return resolve(contents);
            });
        });
    });
};
