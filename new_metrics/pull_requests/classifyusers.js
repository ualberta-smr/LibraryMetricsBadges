const axios = require("axios");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const dbpath = path.resolve(__dirname, "../../badges.db");
const graphQLLink = "https://api.github.com/graphql";
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
    // if number of commits changes, recalculate classification of users
    let pagenum = 1;
    let totalCommits = 0;
    let response = "";
    let users = {};         // user as key -> value as number of commits made
    let contributors = {};  // user as key -> value as number of commits made
    let all = 0;            // total number of all commits regardless of status

    while(true){
        try{
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/commits?per_page=100&page=${pagenum}`, config);
        }
        catch(err){
            console.log("Error occured: ",err);
            return {};
        }
 
        if (response.data.length == 0){
            break;
        }

        // discarding unverified commits with no association to a verified email
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
        console.log(pagenum);
        pagenum++;
    }

    if (totalCommits === 0){
        console.log("Repo contains no commits");
        return {};
    }

    // now filter to get only contribtor user types
    console.log("Total commits vs all commit numbers", totalCommits, all);

    /**
     * Looping through JS Object keys
     * https://stackoverflow.com/a/18202926
     * Author: Danny R https://stackoverflow.com/users/1351261/danny-r
     * user contributions licensed under cc by-sa 3.0 with attribution required. rev 2018.11.5.32076
     */
    Object.keys(users).forEach(user => {
        // divide number of commits user made by total number of all commits
        let percent = users[user] / totalCommits;
        if (percent < 0.10){
            contributors[user] = users[user];
        }
    });

    console.log("All users vs just contributors", Object.keys(users).length, Object.keys(contributors).length); // number of all users vs just contributors

    let query = `INSERT OR REPLACE INTO pullrequests(libname, allcommits, userclassification) VALUES (?,?,?);`;
    try{
        await db.run(query, [libName, all, JSON.stringify(contributors)]);
        return contributors;
    }
    catch(err){
        console.log("Error occured,",err);
        return {};
    }
};

let updateCommitCount = async (owner,libName) => {

    let query = `query {
        repository(owner: "axios", name: "axios") {
            ...RepoFragment
        }
    }
    fragment RepoFragment on Repository {
        defaultBranchRef {
            name
            target {
                ... on Commit {
                    history(first: 0) {
                        totalCount
                    }
                }
            }
        }
    }
    `;

    let number = 0;

    try{
        const response = await axios({
            url: graphQLLink,
            method: "post",
            data: {
                query: query
            },
            headers: {
                "Authorization": `${process.env.TOKEN}`
            }
        });
        number = response.data.data.repository.defaultBranchRef.target.history.totalCount;

        if (number === 0){
            console.log("Repo contains no commits");
            return true;
        }


        let x = "as";
        return new Promise(async (resolve,reject) => {
            await db.get(`SELECT allcommits from pullrequests where libname=${libName};`,  (err, row) => {
                if (typeof row !== "undefined" && row.allcommits == number){
                    return resolve(true);
                }
                else{
                    return resolve(false);
                }
            });
        });
        
    }
    catch(err){
        console.log("Error Occurred: ",err);
        return err;
    }

};

module.exports = async (req) => {
    return new Promise(async (resolve,reject) => {
        const libName = req.query.libname;
        const owner = req.query.owner;
        let commitCount = "placeholder";

        try{
            commitCount = await updateCommitCount(owner, libName);
            console.log(commitCount);
        }
        catch(err){
            console.log("Error has occurred: ", err);
            reject(err);
        }
    
        if (typeof commitCount === "boolean" && !commitCount){
            try{
                const userObj = await classifyUserType(owner,libName);
                if (Object.keys(userObj).length > 0){
                    return resolve(userObj);
                }
            }
            catch(err){
                console.log("Error has occurred: ", err);
                reject(err);
            }
        }
    });

}