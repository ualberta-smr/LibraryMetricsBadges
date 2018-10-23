const fs = require('fs');
const exec = require('child_process').exec;
const path = require("path");
const axios = require("axios");

module.exports = (req,res) => {
    let owner = req.query.owner;
    let libName = req.query.libname;

    // if 0 or 1 releases, it is N/A
    // Otherwise get all days since start of first release and divide by the number of releases
    return new Promise((resolve, reject) => {
        axios.get(`https://api.github.com/repos/${owner}/${libName}/releases`)
            .then((response) => {
                console.log(response);
                response.data.forEach(element => {
                    console.log(element.published_at);
                });
            })
            .catch((err) => {
                console.error(err);
                return reject(err);
            });
    });

};