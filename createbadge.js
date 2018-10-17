// Java 9, Node 8.11.1

const express = require("express"); 
const app = express();

const port = process.env.PORT || 3000;

app.get('/security', (req, res) => {
    console.log(`Hello world`); 
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



