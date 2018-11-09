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
    // `{
    //     repository(owner: "axios", name: "axios") {
    //       pullRequests(last:1 states:MERGED){
    //         edges{
    //           node{
    //             author{
    //               login
    //             }
    //           }
    //         }
    //         pageInfo {
    //           endCursor
    //           hasNextPage
    //         }
    //       }
    //     }
    //   }
    //   `
    let pagenum = 1;
    let merged = 0;             // merged contributor's PRs
    let pullreqs = 0;           // contributor's PRs
    let response = "";
    let numberOfPullReqs = 0;   // total number of PRs

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

        // filter to get only contributor's PRs and merged PRs
        response.data.forEach(element => {
            if (typeof element.user.login != "undefined" && contributors.hasOwnProperty(element.user.login)){
                if (element.merged_at !== null){
                    merged++; 
                }
                pullreqs++; 
            }
            numberOfPullReqs++;
        })
    
        pagenum++;
    }
    
    console.log("Total number of PRs:", numberOfPullReqs);
    console.log("Total number of merged contributor PRs vs all contributor PRs:", merged, pullreqs);

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


        await db.get(`SELECT userclassification from pullrequests where libname=${libName};`,  (err, row) => {
            console.log(row);
            //TODO FIGURE OUT WHY THIS ROW IS UNDEFINED EVEN THO THE RECORD IS IN DATABASE???
            if (typeof row !== "undefined"){
                contributors = JSON.parse(row.userclassification);
            }
            else{
                return reject("Did you run through the /classifyusers endpoint yet", err);
            }
        });


        try{
            arr = await getAllPRs(owner, libName, contributors);
            if (Array.isArray(arr) && arr.length === 0){
                return reject(percentage);
            }
        }
        catch(err){
            return reject(err);
        }

        let query = `INSERT OR REPLACE INTO pullrequests(libname, percent, numPRs) VALUES (?,?,?);`;
        try{
            await db.run(query, [libName, arr[0], arr[1]]);
        }
        catch(err){
            return reject(err);
        }

        return resolve(arr[0]);
    });
};
