// Java 9, Node 8.11.1

const express = require("express"); 
const getSecurity = require("./new_metrics/security/securitybadge");
const getLastDiscussed = require("./existing_metrics/last_discussed/last_discussed_badge");
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Hello world`); 
});

// README file will call an endpoint everytime the page is refreshed
// this will update the badge dynamically 
// Problem is that running shell to update the badge is too slow for web browser
app.get('/security', async (req, res) => {
    await getSecurity(req,res)
        .then(bugs => {
            console.log(bugs);
            res.redirect(302, `https://img.shields.io/badge/security_vulnerabilities-${bugs}-blue.svg`);
        })
        .catch(err => {
            console.log(err);
            res.send("ERROR");
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

app.listen(port, () => {
    console.log('Example app listening on port 3000!');
});



