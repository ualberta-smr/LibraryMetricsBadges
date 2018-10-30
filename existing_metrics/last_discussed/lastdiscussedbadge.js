
const path = require("path");
const axios = require("axios");
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv').config({path:"../../variables.env"});
const moment = require("moment");

const dbpath = path.resolve(__dirname, "../../badges.db");
const db = new sqlite3.Database(dbpath);

const rootURL = `https://api.stackexchange.com/2.2`;
const SO = `site=stackoverflow`;


// search library name up using tag search and select tag with largest number of questions
// with API, get the most recent question contianing tag of library and extract date
module.exports = async (req,res) => {
    let libName = req.query.libname;
    let tagResponse = "N/A";
    let recentQuestion = "N/A";

    return new Promise(async (resolve, reject) => {
        try{
            // get the most popular tag (that has the largest number of questions) associated with the library name
            tagResponse = await axios.get(`${rootURL}/tags/${libName}/info?pagesize=10&order=desc&sort=popular&${SO}&key=${process.env.SO_KEY}`);
        }
        catch(err){
            console.log(err);
            reject(err);
        }

        // if no tag is associated with a library name
        if (tagResponse.data.items.length == 0){
            reject(tagResponse);
        }
        const popularTagName = tagResponse.data.items[0].name;

        try{
            // get the most recent question associated with the popular tag
            recentQuestion = await axios.get(`${rootURL}/questions?pagesize=1&order=desc&sort=creation&${SO}&tagged=${popularTagName}&key=${process.env.SO_KEY}`);
        }
        catch(err){
            console.log(err);
            reject(err);
        }

        // if a tag contains no questions
        if (recentQuestion.data.items.length == 0){
            reject(recentQuestion);
        }

        let latestDate = recentQuestion.data.items[0].creation_date;
        console.log(latestDate);

        latestDate = moment.unix(latestDate).format("MM-DD-YYYY");
        console.log(latestDate);

        let query = `INSERT OR REPLACE INTO lastdiscussed(libname, lastdate) VALUES (?,?);`;
        try{
            await db.run(query, [libName, latestDate]);
        }
        catch(err){
            return err;
        }

        resolve(latestDate);
    });
};
