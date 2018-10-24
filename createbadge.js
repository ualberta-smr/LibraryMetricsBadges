// Java 9, Node 8.11.1

const express = require("express"); 
const path = require("path");
const dotenv = require('dotenv').config({path:"./variables.env"});

const getSecurity = require("./new_metrics/security/securitybadge");
const getRelease = require("./existing_metrics/release_freq/releasebadge");
const getLastDiscussed = require("./existing_metrics/last_discussed/last_discussed_badge");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const axios = require("axios");

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// README file will call an endpoint everytime the page is refreshed
// this will update the badge dynamically once per day due to github cache restrictions
app.get('/security', (req, res) => {
    getSecurity(req,res)
        .then(result => {
            res.redirect(302, `https://img.shields.io/badge/findsecbugs_result-${result.numberofbugs}${result.status}-blue.svg`);
        })
        .catch(err => {
            console.log(err);
            res.send(`ERROR loading security badge for ${req.query.libname}`);
        }); 
});

//https://github.com/settings/tokens/new
//https://www.sohamkamani.com/blog/javascript/2018-06-24-oauth-with-node-js/
app.get('/oauth/redirect', (req, res) => {
    // The req.query object has the query params that
    // were sent to this route. We want the `code` param
    const requestToken = req.query.code;
    axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${requestToken}`,
      headers: {
           accept: 'application/json'
      }
    }).then((response) => {
      const accessToken = response.data.access_token;
      // redirect the user to the welcome page, along with the access token
      res.redirect(`/pullrequests?access_token=${accessToken}`);
    })
    .catch((err) => {
        console.error(err);
    });
});

app.get('/releasefreq', (req, res) => {
    getRelease(req,res)
        .then(result => {
            res.send(`AVERAGE NUM OF DAYS: ${result}`); 
        })
        .catch(err => {
            console.error(err);
        });
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






