const express = require("express"); 
const dotenv = require('dotenv').config({path:"./variables.env"});

const getSecurity = require("./new_metrics/security/securitybadge");
const getRelease = require("./existing_metrics/release_freq/releasebadge");
const getLastDiscussed = require("./existing_metrics/last_discussed/lastdiscussedbadge");
const getIssueResponseTime = require("./existing_metrics/issue_response_time/issueresponsetime");
const getPRs = require("./new_metrics/pull_requests/pullrequests");
const updateUsers = require("./new_metrics/pull_requests/classifyusers");

const app = express();

const port = process.env.PORT || 3000;

/**
 * Reference for how to document Express middleware functions from Stack Overflow
 * https://stackoverflow.com/a/36409525
 * jeff_mcmahan
 * https://stackoverflow.com/users/2757539/jeff-mcmahan
 * user contributions licensed under cc by-sa 3.0 with attribution required. rev 2018.11.5.32076
 */

/**
 * Home Page of Server
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *  
 * @returns {undefined}
 */
app.get('/', (req, res) => {
    res.send("Welcome to Software Metrics Research Page");
});

/**
 * Get Security endpoint for results of Spotbugs run
 * Disclaimer: Update for security badge will be done seperately with updatestats.sh due to heavy shell processing with Spotbugs run
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *  
 * @returns {undefined}
 */
app.get('/security', (req, res) => {
    getSecurity(req)
        .then(result => {
            res.send({
                numbugs: `${result.numberofbugs} ${result.status}`
            });
        })
        .catch(err => {
            console.log(err);
            res.send(`ERROR loading security badge for ${req.query.libname}. Error: ${err}`);
        }); 
});

/**
 * Get Release Frequency endpoint for average number of days between releases
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *  
 * @returns {undefined}
 */
app.get('/releasefreq', (req, res) => {
    getRelease(req)
        .then(result => {
            if (Array.isArray(result)){
                res.send({
                    numdays: `${result[0]} days ${result[1]}`,
                });
            }
            else{
                res.send(`Something happened: ${result}`); 
            }
        })
        .catch(err => {
            console.error(err);
            res.send(`Error occurred: ${err}`);
        });
});

/**
 * Get Last Discussed on Stack Overflow endpoint which outputs last date discussed
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *  
 * @returns {undefined}
 */
app.get('/lastdiscussed', async (req, res) => {
    await getLastDiscussed(req)
        .then(date => {
            res.send({
                lastdate: date
            });
        })
        .catch(err => {
            console.log(err);
            res.send(`Error occurred: ${err}`);
        }); 
});

/**
 * Get Pull Requests endpoint that calculates percentage of merged contributor PRs 
 * Prerequisites: Running the /updateusers endpoint first
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *  
 * @returns {undefined}
 */
app.get('/pullrequests', async(req, res) => {
    await getPRs(req)
        .then(response => {
            res.send({
                percentage: response[0] + "% " + response[1]
            });
        })
        .catch(err => {
            console.log(err);
            res.send(`Error occurred: ${err}`);
        });
});


/**
 * Updates User classification for contributors on a repo needed for PR badge
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *  
 * @returns {undefined}
 */
app.get('/classifyusers', async(req, res) => {
    await updateUsers(req)
        .then(result=> {
            res.send(result);
        })
        .catch(err => {
            console.log(err);
            res.send(`Error occurred: ${err}`);
        });
});

/**
 * Get Issue Response endpoint that shows average number of days for first response to an issue
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *  
 * @returns {undefined}
 */
app.get('/issueresponse', async (req, res) => {
    await getIssueResponseTime(req)
        .then(responseTime => {
            if (typeof responseTime !== "undefined"){
                res.send({
                    responsetime:`${responseTime} days`
                });
            }
            else{
                res.send(`Error occurred: ${err}`);
            }
        })
        .catch(err => {
            console.log(err);
            res.send(`Error occurred: ${err}`);
        });
});

const server = app.listen(port);







