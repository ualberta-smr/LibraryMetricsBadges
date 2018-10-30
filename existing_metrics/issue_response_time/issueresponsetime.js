const path = require("path");
const axios = require("axios");
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv').config({path:"../../variables.env"});
const moment = require("moment");

const dbpath = path.resolve(__dirname, "../../badges.db");
const db = new sqlite3.Database(dbpath);


let config = {
    headers: {
        "Authorization": `${process.env.TOKEN}`
    }
};

// grab all issues of Github repo
// For each issue, extract its creation date and date of the first comment on the issue (if not the author).
// Grab total of days divide by number of issues
// discarded issues that had no comments as we care about the average time the library community took to reply to issues.

let grabIssues = async (owner,libName) => {
    let pagenum = 1;
    let numberOfIssues = 0;
    while (true){
        let response = null;
        try{
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/issues?per_page=100&page=${pagenum}&state=all`, config);
        }
        catch(err){
            return err;
        }

        if (pagenum == 1){
            console.log(response);
        }
        
        if (response.data.length == 0){
            break;
        }

        //response.data[i].created_at
        //response.data[i].comments > 0
            // x = axios(response.data[i].commentsurl)
            // if x.data[i].user.login != response.data[i].user.login
                // x.data[i].created_at - response.data[i].created_at -> in seconds

        //grab all seconds and change to unix time then math.ceil it

        numberOfIssues += response.data.length;
        pagenum += 1
    }
    console.log(numberOfIssues);
};



module.exports = async (req,res) => {
    let owner = req.query.owner;
    let libName = req.query.libname;

    await grabIssues(owner,libName);
}