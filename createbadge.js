const express = require("express"); 
const dotenv = require('dotenv').config({path:"./variables.env"});

const getSecurity = require("./new_metrics/security/securitybadge");
const getRelease = require("./existing_metrics/release_freq/releasebadge");
const getLastDiscussed = require("./existing_metrics/last_discussed/lastdiscussedbadge");
const getIssueResponseTime = require("./existing_metrics/issue_response_time/issueresponsetime");
const getPRs = require("./new_metrics/pull_requests/pullrequests");

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Welcome to Software Metrics Research Page");
});

// Update for security badge will be done seperately with updatestats.sh due to heavy shell processing with Spotbugs run
app.get('/security', (req, res) => {
    getSecurity(req,res)
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

app.get('/releasefreq', (req, res) => {
    getRelease(req,res)
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

app.get('/lastdiscussed', async (req, res) => {
    await getLastDiscussed(req,res)
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

app.get('/pullrequests', async(req, res) => {
    await getPRs(req,res)
        .then(percentage => {
            res.send({
                percentage:percentage + "%"
            });
        })
        .catch(err => {
            console.log(err);
            res.send(`Error occurred: ${err}`);
        });
});

app.get('/issueresponse', async (req, res) => {
    await getIssueResponseTime(req,res)
        .then(responseTime => {
            res.send({
                responsetime:responseTime
            });
        })
        .catch(err => {
            console.log(err);
            res.send(`Error occurred: ${err}`);
        });
});

const server = app.listen(port);







