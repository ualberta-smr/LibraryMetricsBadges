// Java 9, Node 8.11.1

const express = require("express"); 
const getSecurity = require("./new_metrics/security/securitybadge");
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    getSecurity(req,res)
        .then(bugs => {
            return res.redirect(302, `https://img.shields.io/badge/securityvulnerabilities-${bugs}%2-blue.svg`);
        })
        .catch(err => {
            console.log(err);
        }); 
    res.end("Done");
});

// README file will call an endpoint everytime the page is refreshed
// this will update the badge dynamically 

app.get('/security', (req, res) => {
    res.send(`Hello world`); 
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


