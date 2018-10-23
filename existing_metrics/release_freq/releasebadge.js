const fs = require('fs');
const path = require("path");
const axios = require("axios");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const moment = require('moment');
const dotenv = require("dotenv");
const _ = require("lodash");

const dbpath = path.resolve(__dirname, "./release.db");
const releasesDB = new sqlite3.Database(dbpath);

let returnString = "N/A --";

let config = {
    headers: {
        "Authorization": `${process.env.TOKEN}`
    }
};

let grabDates = async (owner,libName,response) => {
    let dates = [];

    // https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795
    for (let i = 0; i < response.data.length; i++){
        tagResponse = await axios.get(`https://api.github.com/repos/${owner}/${libName}/git/tags/${response.data[i].object.sha}`, config);
        try{
            dates.push(tagResponse.data.tagger.date)    
        }
        catch(err){
            console.error(err);
        }
    }

    dates = _.sortBy(dates, olddate => {
        return new Date(olddate);
    });

    return dates;
}

let calculateAverage = async (owner, libName, response) => {
    let dates = await grabDates(owner,libName,response);

    let totaldays = 0;

    for (let index = 0; index < dates.length - 1; index++) {
        let a = moment(dates[index]);
        let b = moment(dates[index + 1]);
        totaldays += Math.abs(a.diff(b, 'days'));
    }
    console.log(totaldays);
};

module.exports = (req,res) => {
    let owner = req.query.owner;
    let libName = req.query.libname;

    // get number of releases via TAGS not RELEASES API
    // if 0 or 1 releases, it is N/A
    // Otherwise get all days since start of first release and divide by the number of releases
    return new Promise((resolve, reject) => {
        axios.get(`https://api.github.com/repos/${owner}/${libName}/git/refs/tags`, config)
            .then((response) => {
                if (response.status != 200){
                    return reject(response.status);
                }
                
                //console.log(response);
                console.log(response.data.length);
                if (response.data.length < 2){
                    return resolve(returnString);
                }

                return resolve(calculateAverage(owner,libName,response));

                // now check if libname exists inside the sql table
                // if it doesn't exist in table, calculate from scratch and insert into table
                // if it does exist in table 
                releasesDB.get(`SELECT numreleases, averagedays FROM releasefreq WHERE libname = "${libName}"`, (err,result) => {
                    if (result.length < 1){

                    }
                    else{
                        if (result.numreleases == response.request.ClientRequest.outputSize){
                            return resolve(result);
                        }
                        else{
                            // need to update the SQL table
                            let data = [``,``,`${libName}`];
                            let query = `UPDATE releasefreq SET numreleases = ?, averagedays = ? WHERE libname = ?`;
                            releasesDB.run(query,data, (err) => {
                                if (err){
                                    console.error(err);
                                    return reject(err);
                                }
                                console.log(`Row(s) updated: ${this.changes}`);
                            });
                        }
                    }
                });
            })
            .catch((err) => {
                console.error(err);
                return reject(err);
            });
    });
};