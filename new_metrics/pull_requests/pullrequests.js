const axios = require("axios");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const moment = require("moment");
const dbpath = path.resolve(__dirname, "../../badges.db");

const db = new sqlite3.Database(dbpath);

let config = {
    headers: {
        "Authorization": `${process.env.TOKEN}`
    }
};

/**
 * Grabs all PRs in repository and filters them based on those associated with a contributor user status
 * and calculates metric percentage using, "total number of merged contributor PR / total number of contributor PRs"
 * 
 * @param {string} owner representing the owner of the repository
 * @param {string} libName representing the name of the repository/library
 * @param {object} contributors with keys as contributor login names, and values as number of commits associated with user
 * 
 * @returns {Array} percentage showing the % of merged contributors PRs in a library, number of merged PRs, 
 * number of contributor PRs, and total number of all PRs
 * 
 * @example owner=google libName=gson contributors={user1:12,user2:3}
 */
let getAllPRs = async(owner, libName, contributors, lastDate) => {
    let pagenum = 1;
    let merged = 0;             // merged contributor's PRs
    let pullreqs = 0;           // contributor's PRs
    let response = "";
    let numberOfPullReqs = 0;   // total number of PRs
    let savedDate = new Date();
    let perPage = 100;

    let endDate = new Date("1970-01-01T00:00:00Z");
    if (typeof lastDate !== "undefined"){
        endDate = new Date(lastDate);
        perPage= 20;                // toggle for faster response when not calculating metric from scratch
    }

    console.log(endDate);
    while(true){
        try{
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/pulls?direction=desc&sort=created&state=all&per_page=${perPage}&page=${pagenum}`, config);
        }
        catch(err){
            console.log(err);
            return err;
        }

        if (response.data.length == 0){
            break;
        }

        if (response.data.length > 0 && pagenum === 1){
            savedDate = new Date(response.data[0].created_at);
        }

        // filter to get only classified contributor PRs for non deleted users
        let done = false;
        for (let i = 0; i < response.data.length; i++){
            let element = response.data[i];
            prDate = new Date(element.created_at);
            if (prDate <= endDate){
                done = true;
                break;
            }
            if (prDate > endDate && typeof element.user.login != "undefined" && contributors.hasOwnProperty(element.user.login)){
                if (element.merged_at !== null){
                    merged++; 
                }
                pullreqs++; 
            }
            numberOfPullReqs++;
        }

        if (done){
            break;
        }
        pagenum++;
    }

    endDate = savedDate;
    console.log("NEW DATE", endDate);
    console.log("Total number of PRs:", numberOfPullReqs);
    console.log("Total number of merged contributor PRs vs all contributor PRs:", merged, pullreqs);

    return [merged, pullreqs, numberOfPullReqs, moment(endDate).toISOString()];
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
    //TODO database updates, if number of merged PRs change or total number of PRs change
    return new Promise( async (resolve, reject) => {
        let libName = req.query.libname;
        let owner = req.query.owner;
        let contributors = {};
        let arr = [];

        if (typeof owner === "undefined" || typeof libName === "undefined"){
            return reject("Query parameters are invalid");
        }

        await db.get(`SELECT userclassification from users where libname="${libName}";`, async (err, row) => {
            if (typeof row !== "undefined"){
                contributors = JSON.parse(row.userclassification);

                await db.get(`SELECT * from pullrequests where libname="${libName}";`, async (err, row) => {

                    // get PR statistics to calculate metric
                    try{
                        arr = await getAllPRs(owner, libName, contributors, row ? row.saveddate: undefined);
                        if (!Array.isArray(arr) || arr.length === 0){
                            return reject(arr);
                        }
                        console.log("return value from getAllPRs", arr);
                    }
                    catch(err){
                        return reject(err);
                    }

                    console.log("rows retrieved", row);
                    if (err){
                        reject(err);
                    }
                    let status = "--";
                    let metric = 0;
                    let query = `INSERT OR REPLACE INTO pullrequests(libname, percent, mergedcount, contributorprcount, numPRs, saveddate, status) VALUES (?,?,?,?,?,?,?);`;

                    if (typeof row !== "undefined"){            
                        let allPRs = arr[1] + row.contributorprcount;
                        let allMerged = arr[0] + row.mergedcount;
                        allPRs > 0 ? metric = Math.floor((allMerged / allPRs * 100)) : 0;

                        if (row.percent < metric){
                            status = "↑";
                        }
                        else if (row.percent > metric){
                            status = "↓";
                        }
                        else{
                            status = "--";
                        }
  
                        try{
                            db.run(query, [libName, metric, allMerged, allPRs, arr[2] + row.numPRs, arr[3], status]);
                            return resolve([metric, status]);
                        }
                        catch(err){
                            return reject(err);
                        }
                    }
                    else{
                        arr[1] > 0 ? metric = Math.floor((arr[0]/arr[1] * 100)) : 0;
                        try{
                            db.run(query, [libName, metric, ...arr, status]);
                            return resolve([metric, status]);
                        }
                        catch(err){
                            return reject(err);
                        }
                    }
        
                });
            }
            else{
                return reject("Did you run through the /classifyusers endpoint yet?", err);
            }
        });
    });
};
