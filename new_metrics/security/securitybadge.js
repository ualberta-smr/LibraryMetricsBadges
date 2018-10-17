var shell = require('shelljs');

// TODO make the function asynchronous as spotbugs takes time to run
module.exports = function(req,res){
    if (shell.exec("./updatestats.sh").code !== 0) {
        shell.echo("Some error occured with updating your badge");
        shell.exit(1);
    }

    // grab the number of bugs from numberofbugs.txt in security folder

    // then create the badge

    return "TEsting function";
};