// Java 9, Node 8.11.1

const express = require("express"); 
const getSecurity = require("./new_metrics/security/securitybadge");
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Hello world`); 
});

// README file will call an endpoint everytime the page is refreshed
// this will update the badge dynamically 
// TODO make this asynchronous as this is slow & inefficient

app.get('/security', (req, res) => {
    getSecurity(req,res)
        .then(bugs => {
            console.log(bugs);
            res.redirect(200, `https://img.shields.io/badge/security_vulnerabilities-${bugs}-blue.svg`);
        })
        .catch(err => {
            console.log(err);
            res.send("ERROR");
        }); 
});

app.get('/releasefreq', (req, res) => {
    res.send(`Hello world`); 
});

app.get('/laststackoverflow', (req, res) => {
    res.send(`Hello world`); 
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



