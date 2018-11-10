const path = require("path");
const axios = require("axios");
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv').config({path:"../../variables.env"});
const moment = require("moment");

const dbpath = path.resolve(__dirname, "../../badges.db");
const db = new sqlite3.Database(dbpath);
const graphQLLink = "https://api.github.com/graphql";

let calculateMetric = async(owner,libName) => {
    // How to Call a GraphQL endpoint using Axios (HTTP client) -- Medium
    // https://medium.com/@stubailo/how-to-call-a-graphql-server-with-axios-337a94ad6cf9
    // Sashko Stubailo https://medium.com/@stubailo

    let cursor = null
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

    return Math.floor((totalMS / validIssues / 86400000));
};

module.exports = async (req) => {
    let owner = req.query.owner;
    let libName = req.query.libname;
    //TODO hook this up with sqlite3

    return new Promise(async (resolve,reject) => {
        if (typeof owner === "undefined" || typeof libName === "undefined"){
            return reject("Query parameters are invalid");
        }
        
        try{
            let response = await calculateMetric(owner,libName);
            console.log(response);
            resolve(response);
        }
        catch(err){
            reject(err);
        }
    });
}