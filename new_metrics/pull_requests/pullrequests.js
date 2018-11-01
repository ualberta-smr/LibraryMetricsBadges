const axios = require("axios");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const dbpath = path.resolve(__dirname, "../../badges.db");

const db = new sqlite3.Database(dbpath);

let config = {
    headers: {
        "Authorization": `${process.env.TOKEN}`
    }
};

// Algorithm for getting % of outside contributers work being merged into REPO
// Grab all pull requests that have been approved in repo
// For every user that created the PR, 
// classify developers as maintainers (≥ 33 % of project commits) 
// or contributors (< 10 %).
// Divide total contributers PR / total of all PRs


// 1. Get all PRs that have been approved
// 2. For every user from 1, check if they are a contributer, 
        // if so -> increment numberofContributerPRs by 1

let getTotalNumCommits = async(owner,libName) => {
    // Algorithm Definition: https://blog.notfoss.com/posts/get-total-number-of-commits-for-a-repository-using-the-github-api/ by notfoss

};


let classifyUserType = async(owner,libName) => {
    // return totalnumberofcommits, object with users as keys: "M for Maintainer and C for Contributer"
    let pagenum = 1;
    let totalCommits = 0;
    let response = "";
    let users = {}; // user as key -> value as number of commits made
    let contributors = {}; // user as key -> bool as value

    while(true){
        try{
            // The repository contributors graph only shows the top 100 contributors to the repository by commits. 
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/commits?per_page=100&page=${pagenum}`, config);
        }
        catch(err){
            console.log(err);
            return err;
        }
 
        if (response.data.length == 0){
            break;
        }

        let x = 0;
        let index = 0
        // discarding unverified commits with no association to user email
        response.data.forEach((element,index) => {
            if (element.author !== null){
                if (!users[element.author.login]){
                    users[element.author.login] = 0;
                }
    
                users[element.author.login]++;
                totalCommits++;
            }
        });

        pagenum++;
    }

    if (totalCommits === 0){
        return "Error";
    }
    console.log(users);

    // Looping through JS Object keys -> https://stackoverflow.com/a/18202926 by Danny R
    Object.keys(users).forEach(user => {
        // divide number of commits user made by total number of commits
        if ((Math.floor(users[user] / totalCommits) < 0.10)){
            contributors[user] = users[user];
        }
    });

};

let getAllPRs = async(owner, libName) => {
    let pagenum = 1;
    let pulls = [];
    let response = "";
    let numberOfPullReqs = 0;

    while(true){
        try{
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/pulls?state=closed&per_page=100&page=${pagenum}`, config);
        }
        catch(err){
            console.log(err);
            return err;
        }

        if (response.data.length == 0){
            break;
        }

        response.data.forEach(element => {
            if (element.merged_at !== null){
                pulls.push(element.user.login);
                numberOfPullReqs++;
            }
        });
    
        pagenum++;
    }
    
    return [pulls, numberOfPullReqs];
};



module.exports = (req,res) => {
    return new Promise( async (resolve, reject) => {
        let libName = req.query.libname;
        let owner = req.query.owner;
        let arr = [];

        // try{
        //     arr = await getAllPRs(owner, libName);
        //     if (arr[0].length == 0){
        //         return reject(arr);
        //     }
        // }
        // catch(err){
        //     return reject(err);
        // }

        // let pulls = arr[0];
        // let numberOfPullReqs = arr[1];

        try{
            arr = await classifyUserType(owner, libName);
        }
        catch(err){
            return reject(err);
        }

        
        // db.get(`SELECT numberofbugs, status FROM bugs WHERE libname = "${name}"`, (err, result) => {
        //     if (err){
        //         console.log(err);
        //         return reject(err);
        //     }
        //     if (typeof result == "undefined"){
        //         return reject("No results found for this Java library. Did you add your library to repositories.txt and run setup.sh?");
        //     }
        //     return resolve(result);
        // });
    });
};
