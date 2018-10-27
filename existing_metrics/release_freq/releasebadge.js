// Ednpoint times out if there are over 300ish release tags, but if left running it will save properly to database

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
    for (let i = 0; i < response.length; i++){
        try{
            tagResponse = await axios.get(response[i], config);
            dates.push(tagResponse.data.commit.author.date);  
        }
        catch(err){
            console.error(err);
            return err; 
        }
    }
    return dates;
};

let calculateAverage = async (dates) => {
    let alldates = await grabDates(dates);
    
    if (!alldates || alldates.length == 0){
        return false;
    }

    alldates = await _.sortBy(alldates, olddate => {
        return new Date(olddate);
    });
    
    let totaldays = 0;
    for (let index = 0; index < alldates.length - 1; index++) {
        let a = moment(alldates[index]);
        let b = moment(alldates[index + 1]);
        totaldays += Math.abs(a.diff(b, 'days'));
    }

    return Math.ceil(totaldays / dates.length);
};

let insertEntry = async (data) => {
    let placeholders = data.map((elem) => "?").join(",");
    let query = `INSERT INTO releasefreq(libname, numreleases, averagedays, status) VALUES (${placeholders})`;
    try{
        console.log("INSERT NEW VALUE");
        await db.run(query, data);
    }
    catch(err){
        return err;
    }
};

let updateEntry = async (data) => {
    let query = `UPDATE releasefreq SET numreleases = "?", averagedays = "?", status = "?" WHERE libname = "?"`;
    try{
        console.log("UPDATE EXISTING VALUE");
        await db.run(query, data);
    }
    catch(err){
        return err;
    }
};


let getReleases = async (owner, libName, error, numberofreleases) => {
    let pagenum = 1;
    let urls = [];
    while(true){
        let response = await axios.get(`https://api.github.com/repos/${owner}/${libName}/tags?per_page=100&page=${pagenum}`, config);

        if (response.status != 200){
            error = true;
            return response.status;
        }

        if (pagenum == 1 && response.data.length < 2){
            numberofreleases = response.data.length;
            return [];
        }

        if (response.data.length == 0){
            break;
        }

        numberofreleases += response.data.length;

        response.data.forEach(element => {
            urls.push(element.commit.url);
        });
    
        pagenum++;
    }
    
    return [urls ,numberofreleases];
}

module.exports = async (req,res) => {
    let owner = req.query.owner;
    let libName = req.query.libname;
    let average = "N/A";
    let urls = [];
    let numberofreleases = 0;
    let error = false;
 
    return new Promise( async (resolve, reject) => {
        if (typeof owner == "undefined" || typeof libName == "undefined"){
            return reject("Query parameters are invalid");
        }
        let arr = await getReleases(owner, libName, error, numberofreleases);
        if (error){
            return reject(arr);
        }
        if (arr.length < 2){
            urls = arr;
        }
        else{
            urls = arr[0];
            numberofreleases = arr[1];
        }

        await db.get(`SELECT numreleases, averagedays, status FROM releasefreq WHERE libname = "${libName}"`, async (err,queryResult) => {
            if (typeof queryResult == "undefined"){
                // entry doesnt exist in table. Go calculate average release frequency then insert into table.
                if (urls.length > 1){
                    average = await calculateAverage(urls);
                    if(!average){
                        return reject(average);
                    }
                }

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
                    console.log("NO CHANGE: grab existing value in database");
                    return resolve([queryResult.averagedays, queryResult.status]);
                }
                // entry exists but we need to update the table
                else{
                    let status = "--";

                    if (urls.length > 1){
                        average = await calculateAverage(urls);
                        if(!average){
                            return reject(average);
                        }
                        if (queryResult.averagedays < average){
                            status = "↑";
                        }
                        else if(queryResult.averagedays > average){
                            status = "↓";
                        }
                    }
    
                    let data = [numberofreleases, average, status, libName];
                    
                    try{
                        console.log(data);
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