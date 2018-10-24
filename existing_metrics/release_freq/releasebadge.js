const fs = require('fs');
const path = require("path");
const axios = require("axios");
const sqlite3 = require('sqlite3').verbose();
const Promise = require("bluebird");
const moment = require('moment');
const dotenv = require('dotenv').config({path:"../../variables.env"});
const _ = require("lodash");

const dbpath = path.resolve(__dirname, "../../badges.db");
const db = new sqlite3.Database(dbpath);

let returnString = "N/A --";

let config = {
    headers: {
        "Authorization": `${process.env.TOKEN}`
    }
};

let grabDates = async (response) => {
    let dates = [];

    // https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795
    for (let i = 0; i < response.data.length; i++){
        // still too slow since we need to make a axios request for every commit
        try{
            tagResponse = await axios.get(`${response.data[i].commit.url}`, config);
            dates.push(tagResponse.data.commit.author.date);  
        }
        catch(err){
            console.error(err);
            return err; 
        }
    }

    dates = _.sortBy(dates, olddate => {
        return new Date(olddate);
    });

    return dates;
};

let calculateAverage = async (response) => {
    try{
        let dates = await grabDates(response);

        let totaldays = 0;
        for (let index = 0; index < dates.length - 1; index++) {
            let a = moment(dates[index]);
            let b = moment(dates[index + 1]);
            totaldays += Math.abs(a.diff(b, 'days'));
        }

        return Math.ceil(totaldays / dates.length);
    }
    catch(err){
        console.error(err);
        return err;
    }
};

module.exports = (req,res) => {
    let owner = req.query.owner;
    let libName = req.query.libname;

    // get number of releases via TAGS not RELEASES API
    // if 0 or 1 releases, it is N/A
    // Otherwise get all days since start of first release and divide by the number of releases
 
    return new Promise( async (resolve, reject) => {
        let response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/tags?per_page=100`, config);
        
        if(!response){
            return reject(response);
        }
        if (response.status != 200){
            return reject(response.status);
        }
        console.log(response.data.length);
        if (response.data.length < 2){
            return resolve(returnString);
        }


        // now check if libname exists inside the sql table
        // if it doesn't exist in table, calculate from scratch and insert into table
        // if it does exist in table 
        db.get(`SELECT numreleases, averagedays FROM releasefreq WHERE libname = "${libName}"`, (err) => {
            console.log(this.numreleases);
            if (typeof this.numreleases == "undefined"){
                // entry doesnt exist in table. Go calculate average then insert into table.
                let average = calculateAverage(response);
                console.log(average);
                if (typeof average != "number"){
                    return reject(average);
                }
                
                let data = [libName, response.data.length, average, "--"];
                let placeholders = data.map((value) => '(?)').join(',');
                let query = `INSERT INTO releasefreq(libname, numreleases, averagedays, status) VALUES` + placeholders;
                
                db.run(query, data, (err) => {
                    if (err) {
                        console.error(err.message);
                        return reject(err);
                    }
                    console.log(`Rows inserted ${this.changes}`);
                    return resolve([average, "--"]);
                });
            
            }
            else{
                // entry exists in table and has not changed, just return the result
                if (result.numreleases == response.data.length){
                    return resolve([result.averagedays, result.status]);
                }
                else{
                    // entry exists but we need to update the table
                    let average = calculateAverage(response);
                    if (typeof average != "number"){
                        return reject(average);
                    }

                    let status = "--";
                    if (result.averagedays < average){
                        status = "↑";
                    }
                    else if(result.averagedays > average){
                        status = "↓";
                    }

                    let data = [response.data.length, average, status];
                    
                    let query = `UPDATE releasefreq SET numreleases = ?, averagedays = ?, status = ? WHERE libname = ${libName}`;
                    
                    db.run(query, data, (err) => {
                        if (err){
                            console.error(err);
                            return reject(err);
                        }
                        console.log(`Row(s) updated: ${this.changes}`);
                        return resolve([result.averagedays, result.status]);
                    });
                }
            }
        });
            
    });
};