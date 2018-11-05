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

/**
 * Classify contributor user type by checking if total number commits user made is less than 10% of all commits
 * 
 * @param {string} owner representing the owner of the repository
 * @param {string} libName representing the name of the repository/library
 * 
 * @returns {object} contributors -> key:users, value:number of commits made
 * 
 * @example owner=google libName=gson 
 */
let classifyUserType = async(owner,libName) => {
    let pagenum = 1;
    let totalCommits = 0;
    let response = "";
    let users = {}; // user as key -> value as number of commits made
    let contributors = {}; // user as key -> bool as value
    let all = 0; // total number of all commits regardless of null status

    while(true){
        try{
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/commits?per_page=100&page=${pagenum}`, config);
        }
        catch(err){
            console.log(err);
            return err;
        }
 
        if (response.data.length == 0){
            break;
        }

        // discarding unverified commits with no association to user email
        response.data.forEach((element) => {
            if (element.author !== null){
                if (!users[element.author.login]){
                    users[element.author.login] = 0;
                }
    
                users[element.author.login]++;
                totalCommits++;
            }
            all++;
        });
        pagenum++;
    }

    if (totalCommits === 0){
        return "Error";
    }

    // now filter to get only contribtor user types
    console.log("Total commits vs all commit numbers", totalCommits, all);

    // Looping through JS Object keys -> https://stackoverflow.com/a/18202926 by Danny R
    Object.keys(users).forEach(user => {
        // divide number of commits user made by total number of commits
        let percent = users[user] / totalCommits;
        if (percent < 0.10){
            contributors[user] = users[user];
        }
    });

    console.log("All users vs just contributors", Object.keys(users).length, Object.keys(contributors).length); // number of all users vs just contributors

    return contributors;
};

/**
 * Grabs all PRs in repository and filters them based on those associated with a contributor user status
 * and calculates metric percentage using, "total number of merged contributor PR / total number of contributor PRs"
 * 
 * @param {string} owner representing the owner of the repository
 * @param {string} libName representing the name of the repository/library
 * @param {object} contributors with keys as contributor login names, and values as number of commits associated with user
 * 
 * @returns {Array} percentage showing the % of merged contributors PRs in a library, and total number of pull requests
 * 
 * @example owner=google libName=gson contributors={user1:12,user2:3}
 */
let getAllPRs = async(owner, libName, contributors) => {
    let pagenum = 1;
    let merged = 0;
    let pullreqs = 0;
    let response = "";
    let numberOfPullReqs = 0;

    while(true){
        try{
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/pulls?state=all&per_page=100&page=${pagenum}`, config);
        }
        catch(err){
            console.log(err);
            return err;
        }

        if (response.data.length == 0){
            break;
        }

        response.data.forEach(element => {
            if (typeof element.user.login != "undefined" && contributors.hasOwnProperty(element.user.login)){
                if (element.merged_at !== null){
                    merged++; // merged contributor's PRs
                }
                pullreqs++; // contributor's PRs
            }
            numberOfPullReqs++;
        })
    
        pagenum++;
    }
    
    console.log(numberOfPullReqs);
    console.log(merged, pullreqs);

    return [Math.floor((merged/pullreqs * 100)), numberOfPullReqs];
};

/**
 * GET request endpoint that calculates metric of contributor's merged PRs and stores it into database
 * given a library and owner name
 * 
 * @param {object} req contains the request user made
 * 
 * @returns {number} percentage containing number of outside contributor's work that is merged into repo
 * 
 * @example localhost:3000/pullrequests?owner=axios&libname=axios
 */
module.exports = (req) => {
    return new Promise( async (resolve, reject) => {
        let libName = req.query.libname;
        let owner = req.query.owner;
        let contributors = {};
        let arr = [];

        try{
            contributors = await classifyUserType(owner, libName);
        }
        catch(err){
            return reject(err);
        }

        try{
            arr = await getAllPRs(owner, libName, contributors);
            if (arr.length === 0){
                return reject(percentage);
            }
        }
        catch(err){
            return reject(err);
        }

        let query = `INSERT OR REPLACE INTO pullrequests(libname, percent, numrequests) VALUES (?,?,?);`;
        try{
            await db.run(query, [libName, arr[0], arr[1]]);
        }
        catch(err){
            return reject(err);
        }

        return resolve(arr[0]);
    });
};
