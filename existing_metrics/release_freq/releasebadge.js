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

    return dates;
};

let calculateAverage = (dates) => {
    
    let totaldays = 0;
    for (let index = 0; index < dates.length - 1; index++) {
        let a = moment(dates[index]);
        let b = moment(dates[index + 1]);
        totaldays += Math.abs(a.diff(b, 'days'));
    }

    return Math.ceil(totaldays / dates.length);

};

let insertEntry = async (data) => {

    let placeholders = data.map((elem) => "?").join(",");
    let query = `INSERT INTO releasefreq(libname, numreleases, averagedays, status) VALUES (${placeholders})`;
    try{
        console.log("INSERT");
        await db.run(query, data);
    }
    catch(err){
        return err;
    }
};

let updateEntry = async (data) => {
    let query = `UPDATE releasefreq SET numreleases = "?", averagedays = "?", status = "?" WHERE libname = "?"`;
    try{
        console.log("UPDATE");
        await db.run(query, data);
    }
    catch(err){
        return err;
    }
};


let getReleases = async (owner, libName) => {
    let alldates= [];
    let pagenum = 1;
    let numberofreleases = 0;

    while(true){
        let response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/tags?per_page=100&page=${pagenum}`, config);

        if(!response){
            return reject(response);
        }

        if (response.data.length == 0){
            break;
        }

        if (response.status != 200){
            return reject(response.status);
        }
        if (pagenum == 1 && response.data.length < 2){
            return resolve(returnString);
        }

        numberofreleases += response.data.length;
        let dates = await grabDates(response);
        if (!Array.isArray(dates)){
            return reject(response);
        }
        
        alldates = [...alldates, ...dates];
        pagenum++;
    }
    
    alldates = await _.sortBy(alldates, olddate => {
        return new Date(olddate);
    });

    return [alldates,numberofreleases];
}

module.exports = async (req,res) => {
    let owner = req.query.owner;
    let libName = req.query.libname;


    // get number of releases via TAGS not RELEASES API
    // if 0 or 1 releases, it is N/A
    // Otherwise get all days since start of first release and divide by the number of releases
 
    return new Promise( async (resolve, reject) => {

        let arr = await getReleases(owner, libName);
        let alldates = arr[0];
        let numberofreleases = arr[1];

        await db.get(`SELECT numreleases, averagedays, status FROM releasefreq WHERE libname = "${libName}"`, async (err,queryResult) => {
            if (typeof queryResult == "undefined"){
                // entry doesnt exist in table. Go calculate average then insert into table.
                let average = calculateAverage(alldates);

                let status = "--";
                let data = [libName, numberofreleases, average, status];

                try{
                    await insertEntry(data);
                    return resolve([average, status]);
                }
                catch(err){
                    return reject(err);
                }
            }
            else{
                // entry exists in table and has not changed, just return the result
                if (queryResult.numreleases == numberofreleases){
                    // TODO grab number of releases earlier cuz its too slow
                    console.log("NO CHANGE");
                    return resolve([queryResult.averagedays, queryResult.status]);
                }
                // entry exists but we need to update the table
                else{
                    let average = calculateAverage(alldates);
    
                    let status = "--";
                    if (queryResult.averagedays < average){
                        status = "↑";
                    }
                    else if(queryResult.averagedays > average){
                        status = "↓";
                    }
    
                    let data = [numberofreleases, average, status, libName];
                    
                    try{
                        await updateEntry(data);
                        return resolve([average, status]);
                    }
                    catch(err){
                        return reject(err);
                    } 
    
                }
            }   
        });
    });
};