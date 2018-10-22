// Java 9, Node 8.11.1

const express = require("express"); 
const getSecurity = require("./new_metrics/security/securitybadge");
const getLastDiscussed = require("./existing_metrics/last_discussed/last_discussed_badge");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");

const security_db = new sqlite3.Database('./new_metrics/security/bugs.db');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Hello world`); 
});

// README file will call an endpoint everytime the page is refreshed
// this will update the badge dynamically once per day due to github cache restrictions
app.get('/security', async (req, res) => {
    await getSecurity(req,res)
        .then(result => {
            res.redirect(302, `https://img.shields.io/badge/findsecbugs_result-${result.numberofbugs}${result.status}-blue.svg`);
        })
        .catch(err => {
            console.log(err);
            res.send(`ERROR loading security badge for ${req.query.libname}`);
        }); 
});

app.get('/releasefreq', (req, res) => {
    res.send(`Hello world`); 
});

app.get('/lastdiscussed', async (req, res) => {
    await getLastDiscussed()
        .then(lastdate => {
            console.log(lastdate);
            res.redirect(302, `https://img.shields.io/badge/last_discussed_SO-${lastdate}-yellow.svg`);
        })
        .catch(err => {
            console.log(err);
            res.send("ERROR");
        }); 
});

app.get('/pullrequests', (req, res) => {
    res.send(`Hello world`); 
});

app.get('/issueresponse', (req, res) => {
    res.send(`Hello world`); 
});


app.listen(port);






