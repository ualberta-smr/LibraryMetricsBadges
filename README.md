# Exploring Software Library Metrics with GitHub Badges 
![Security Badge](https://img.shields.io/badge/dynamic/json.svg?label=FindSecBugs%20Result&url=http%3A%2F%2Fc9b1c971.ngrok.io%2Fsecurity%3Flibname%3Djunit4&query=numbugs)
![Release Frequency Badge](https://img.shields.io/badge/dynamic/json.svg?label=Release%20Frequency&url=http%3A%2F%2Fc9b1c971.ngrok.io%2Freleasefreq%3Fowner%3Djunit-team%26libname%3Djunit4&query=numdays&colorB=blue&suffix=%20%20days)

## Prerequisites
* Node versions 8.11.1 or above
* NPM should be bundled with the Node version above (at least 5.6.0)
* Lots of memory due to cloning of other open source libraries and Spotbugs necessities 
* Java version 8 (but some git cloning of libraries may need version 9 or 10 instead)
* Maven and Gradle
* Sqlite3 that can run on command line
* Git 
	* configured so that it can run various commands like `git clone & git pull` on command line without authentication

## Environment Setup
* Fork repository
* Inside of root folder of repo, run `npm install` to grab necessary dependencies
* Inside of root folder of repo, run `sqlite3 badges.db < tables.sql` to setup an empty database 
* TODO -> Write procedure for setting up env variables and Github OAuth

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
			* run inside of security directory, `bash clonelibs.sh < repositories.txt`, then `bash compilelibs.sh`, finally `bash updatestats.sh`
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

