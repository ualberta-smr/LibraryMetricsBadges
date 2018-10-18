
var fs = require('fs');
var exec = require('child_process').exec;

module.exports = function(req,res){

    // grab the number of bugs from numberofbugs.txt in security folder
    // then create the badge

    return new Promise((resolve, reject) => {
        exec("bash ./updatestats.sh", function(err,stdout,stderr) {
            if (err){
                return reject(err.code);
            }

            fs.readFile('numberofbugs.txt', 'utf8', function(err, contents) {
                console.log(contents);
                return resolve(contents);
            });
        });
    });
};
