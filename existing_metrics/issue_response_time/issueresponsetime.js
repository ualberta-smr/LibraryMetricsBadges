const path = require("path");
const axios = require("axios");
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv').config({path:"../../variables.env"});
const moment = require("moment");

const dbpath = path.resolve(__dirname, "../../badges.db");
const db = new sqlite3.Database(dbpath);
const graphQLLink = "https://api.github.com/graphql";

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
    let totalSeconds = 0;
    let issuesWithComments = 0;

    while (true){
        let response = null;
        try{
            response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/issues?per_page=100&page=${pagenum}&state=all`, config);
        }
        catch(err){
            return err;
        }
        
        if (response.data.length == 0){
            break;
        }
        
        response.data.forEach(async element => {
            if(element.created_at){
                if (element.comments > 0){
                    let detailedComment = await axios.get(element.comments_url + "?per_page=1",config);
                    console.log(detailedComment);
                    // checking if the user who first commented is not the one who authored the original issue
                    if (detailedComment.data[0].user.login != element.user.login){
                        let a = moment(detailedComment.created_at).valueOf();
                        let b = moment(element.created_at).valueOf();
                        totalSeconds += Math.abs(a-b);
                        issuesWithComments++;
                    }
                }
            }
        });
        //response.data[i].comments > 0
            // x = axios(response.data[i].commentsurl)
            // if x.data[i].user.login != response.data[i].user.login
                // x.data[i].created_at - response.data[i].created_at -> in seconds

        //grab all seconds and change to unix time then math.ceil it

        numberOfIssues += response.data.length;
        pagenum += 1
    }
    console.log(numberOfIssues);
    console.log(totalSeconds);
};

let getDayRange = async(owner,libName) => {
    // https://medium.com/@stubailo/how-to-call-a-graphql-server-with-axios-337a94ad6cf9
    let cursor = null;
    let next = true;
    let totalMS = 0;
    let totalIssues = 0;
    let validIssues = 0;
    let state = "OPEN";
    while (next){
        try{
            let query =
            `   query {
                    repository(owner:  ${owner}, name: ${libName}) {
                        issues(first: 100, states: ${state}, after:${cursor}) {
                            edges {
                                node {
                                    createdAt
                                    author {
                                    login
                                }
                                comments(first: 1) {
                                    edges {
                                        node {
                                            createdAt
                                            author {
                                                login
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        pageInfo {
                            endCursor
                            hasNextPage
                        }
                    }
                }   
            }`;

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
            
            const root = response.data.data.repository;

            root.issues.edges.forEach(element => {
                // element.node.author.login is the one who created issue
                // element.comments.edges[0].node.author.login is the one who first commented on issue

                // to make sure we dont account for deleted accounts
                if(element.node.author !== null && element.node.comments.edges.length > 0){
                    // to check if the author of first comment isn't deleted account
                    if (typeof element.node.comments.edges[0] !== "undefined"
                        && (element.node.author.login !== element.node.comments.edges[0].node.author.login)){
                        const issueCreation = moment(new Date(element.node.createdAt)).valueOf();
                        const firstComment = moment(new Date(element.node.comments.edges[0].node.createdAt)).valueOf();
                        totalMS += Math.abs(issueCreation - firstComment);
                        validIssues++;
                    }
                }
                totalIssues++;
            });

            if(root.issues.pageInfo.hasNextPage){
                cursor = `"${root.issues.pageInfo.endCursor}"`;
            }
            else if (!root.issues.pageInfo.hasNextPage && state == "OPEN"){
                cursor = null;
                state = "CLOSED";
            }
            else{
                next = false;
            }
        }
        catch(err){
            console.log(err);
        }
    } 
    console.log(totalIssues, validIssues);
};

module.exports = async (req,res) => {
    let owner = req.query.owner;
    let libName = req.query.libname;

    //await grabIssues(owner,libName);
    await getDayRange(owner,libName);


}