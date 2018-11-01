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

// Algorithm for getting % of outside contributers work being merged as PR
// Grab all pull requests that have been approved in repo
// For every user that created the PR, 
// classify developers as maintainers (≥ 33 % of project commits) 
// or contributors (< 10 %).
// Divide total contributers PR / total of all PRs


let getAllPRs = async (owner, libName) => {
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

        if (pagenum == 1 && response.data.length == 0){
            numberOfPullReqs = response.data.length;
            return [pulls, numberOfPullReqs];
        }

        if (response.data.length == 0){
            break;
        }

        numberOfPullReqs += response.data.length;

        response.data.forEach(element => {
            urls.push(element.commit.url);
        });
    
        pagenum++;
    }
    
    return [pulls, numberOfPullReqs];
}



module.exports = (req,res) => {
    return new Promise( async (resolve, reject) => {
        let linName = req.query.libname;
        let owner = req.query.owner;
        
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
