# Exploring Software Library Metrics with GitHub Badges 
![Security Badge](https://img.shields.io/badge/dynamic/json.svg?label=FindSecBugs%20Result&url=http%3A%2F%2F74ce0b03.ngrok.io%2Fsecurity%3Flibname%3Dgson&query=numbugs&colorB=orange)
![Release Frequency Badge](https://img.shields.io/badge/dynamic/json.svg?label=Release%20Frequency&url=http%3A%2F%2F74ce0b03.ngrok.io%2Freleasefreq%3Fowner%3Dgoogle%26libname%3Dgson&query=numdays&colorB=blue)
![Last Discussed on Stack Overflow Badge](https://img.shields.io/badge/dynamic/json.svg?label=Last%20Discussed%20on%20Stack%20Overflow&url=http%3A%2F%2F74ce0b03.ngrok.io%2Flastdiscussed%3Flibname%3Dgson&query=lastdate&colorB=9400D3)

## Prerequisites
* Node versions 8.11.1 or above
* NPM versions 5.6.0 or above
* Lots of memory due to cloning of other open source libraries and Spotbugs necessities 
* Java version 8 or above
	* Disclaimer: Some libraries may not compile properly if not on 9 or 10
* Maven (3.5.4) and Gradle (4.10.2) or above
* Sqlite3 that can run on command line
* Git 
	* configured so that it can run various commands like `git clone & git pull` on command line without authentication

## Environment Setup
* Fork repository
* Inside of root folder of repo, run `npm install` to grab necessary dependencies
* Inside of root folder of repo, run `sqlite3 badges.db < tables.sql` to setup an empty database 
* TODO -> Write procedure for setting up env variables for authentication
* https://github.com/settings/tokens
* https://stackapps.com/apps/oauth/register

## Folder Structure and Setup per badge
* existing_metrics
	* last_discussed

	* issue_response_time

	* release_freq
		* Will calculate average number of days between 2 >= releases
		* contains file, releasebadge.js that handles all Github API calls and constructs JSON response for badge creation
		* no additional setup needed

* new_metrics
	* security
		* add any Java, public Github repository clone link to `repositories.txt`
		* To update stat given that library has been compiled already:
			* run `bash updatestats.sh`
		* To go through entire process of git cloning, Maven/Gradle compilation, then running SpotBugs
			* run inside of security directory, `bash setup.sh`
		* dynamic update of badge is seperate from badge image itself
	
	* pull_requests


## Endpoints
* security
	* localhost:3000/security?libname=SOMEJAVALIBRARYNAME
		* e.g. localhost:3000/security?libname=gson
	* NOTE -> you will need cloned and compiled Java repos on your local machine (see folder structure for setup)
* release frequency
	* localhost:3000/releasefreq?owner=OWNEROFORGANIZATIONORREPO&libname=SOMEIBRARYNAME
		* e.g. localhost:3000/releasefreq?owner=junit-team&libname=junit5
	* Insert any open source, public, Github respository in the query fields

