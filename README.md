# Exploring Software Library Metrics with Repository Badges 

## Project Badge Examples
![Security Badge](https://img.shields.io/badge/FindSecurityBugs-2%20%E2%86%91-orange.svg)
![Release Frequency Badge](https://img.shields.io/badge/ReleaseFrequency-30%20days%20%E2%86%93-blue.svg)
![Last Discussed on Stack Overflow Badge](https://img.shields.io/badge/Last%20Discussed%20on%20Stack%20Overflow-11--01--2018-lightgrey.svg)
![Contributor PRs Merge Rate Badge](https://img.shields.io/badge/Contributor%20PR%20Merge%20Rate-89%25%20%E2%86%93-yellowgreen.svg)
![Issue Response Time Average Badge](https://img.shields.io/badge/Issue%20Response%20Time%20Average-22%20days%20%E2%86%91-brightgreen.svg)

## Description
Libraries, Frameworks, and Application Programming Interfaces (APIs) provide users a way to reuse existing functionalities written within the library itself. Using libraries allows users to focus on their own work more effectively instead of implementing existing features from scratch. With many libraries out there, it is often not clear how to select the best one to use for your project. Here, we look into quantitative software metrics that exert a library's inner qualities such as build status and test code coverage and turn them into visual repository badges. These repository badges are frequently found in README files and provides an accessible way for users to compare metrics between libraries to help determine the best fit for their work. *This project oversees new and previously worked on metrics and how we transformed those into badges.*

## Contributors
Project developed by the Software Maintenance and Reuse lab [(SMR)](https://sarahnadi.org/smr/), University of Alberta. </br>
Developers: [Monica Bui](https://github.com/bui1), [Sarah Nadi](https://sarahnadi.org)

## Documentation
Documentation on various functions used in the scripts will be found in [docs/docs.md](docs/docs.md).
For more detailed descriptions of methodologies used to calculate each badge's metrics, it can be found in [docs/methods.md](docs/methods.md)

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
* [Ngrok](https://ngrok.com/download)

## Environment Setup
* Fork repository
* Inside root folder of repo, run `npm install` to grab necessary dependencies
* Inside root folder of repo, run `sqlite3 badges.db < tables.sql` to setup an empty database 
* Inside root folder of repo, create file called `variables.env`
	* Make 2 environment variables called TOKEN and SO_KEY
		* Get personal access token from [Github](https://github.com/settings/tokens)
		* Get API Key from [Stack Overflow](https://stackapps.com/apps/oauth/register)
		* Image of Stack Overflow Auth
		* ![Image of Stack Overflow Auth](pictures/stackoverflowkey.png?raw=true)
		* Input those keys into the file e.g
			* TOKEN=bearer INPUTYOURTOKEN
			* SO_KEY=INPUTYOURKEY

## Folder Structure and Setup per badge
* existing_metrics
	* last_discussed
		* Gets latest date of a Stack Overflow question about the library
		* *lastdiscussedbadge.js* -> handles Github API calls and constructs JSON response for badge creation
		* no additional setup needed
	* issue_response_time
		* Calculates average time to get a response for an issue
		* *issuereponsetime.js* -> handles Github API calls and constructs JSON response for badge creation
		* no additional setup needed
	* release_freq
		* Calculates average number of days between 2 or more releases
		* *releasebadge.js* -> handles Github API calls and constructs JSON response for badge creation
		* no additional setup needed

* new_metrics
	* security
		* Gets number of security bugs found by Spotbugs with FindSecBugs plugin
		* Add any Java, public Github repository clone link to `repositories.txt`
		* To go through entire process of git cloning, Maven/Gradle compilation, then running SpotBugs
			* Run inside of security directory, `bash setup.sh`
		* To update stat given that library has been compiled already:
			* Run `bash updatestats.sh`
		* Dynamic update of badge is seperate from badge image itself <br/>
	* pull_requests
		* Calculates contributor PR merge approval percentage
		* Run classifyusers endpoint first (see Endpoints section below)
		* no additional setup needed

## Endpoints
* Security
	* **NOTE -> you will need cloned and compiled Java repos on your local machine (see folder structure for setup)**
	* localhost:3000/security?libname=SOMEJAVALIBRARYNAME
		* e.g. localhost:3000/security?libname=gson  
* Release Frequency
	* localhost:3000/releasefreq?owner=OWNEROFORGANIZATIONORREPO&libname=SOMEIBRARYNAME
		* e.g. localhost:3000/releasefreq?owner=junit-team&libname=junit5
	* Insert any open source, public, Github respository in the query fields    
* Last Discussed on Stack Overflow
	* localhost:3000/lastdiscussed?libname=SOMEIBRARYNAME
		* e.g. localhost:3000/lastdiscussed?libname=momentjs
* Issue Response Time
	* localhost:3000/issueresponse?owner=OWNEROFORGANIZATIONORREPO&libname=SOMEIBRARYNAME
		* e.g. localhost:3000/issueresponse?owner=junit-team&libname=junit5  
* Contributor PR Merge Rate
	* **NOTE -> you will need to run the classify users endpoint first**
	* localhost:3000/pullrequests?owner=OWNEROFORGANIZATIONORREPO&libname=SOMEIBRARYNAME
		* e.g. localhost:3000/pullrequests?owner=junit-team&libname=junit5    
* Classify Users 
	* localhost:3000/classifyusers?owner=OWNEROFORGANIZATIONORREPO&libname=SOMEIBRARYNAME
		* e.g. localhost:3000/classifyusers?owner=junit-team&libname=junit5   

## Running Project
* Setup Security and Contributor PR endpoints first
* *All scripts run from `createbadge.js` which is our main server*
* Badge Creation
	* Run `npm run start` on one terminal session
	* Run `ngrok http 3000` on another session
		* Get the Forwarding link on the ngrok session which changes for every new
		run if session is exited 
			* e.g  http://f212a1f2.ngrok.io
	* Directed to *http://f212a1f2.ngrok.io* for example which then you can access any of the above endpoints using the internet browser or an API client like Postman
		* http://f212a1f2.ngrok.io/classifyusers?owner=google&libname=gson
	* Once you use an endpoint it will return a JSON object
		* Get the key e.g numdays:10 where numdays is the term you want
	* Go to [Shields.io](https://shields.io/#/)
	* Scroll down to Dynamic Section
	* Input values for label, url, query, color 
		* Badge Input Example
		* ![Badge Input](pictures/shieldsioinput.png?raw=true)
	* Finally, grab Shields url given in the url bar and make a link to it on your README
* Generate Docs
	* Run `npm run docs:build`
	* New documentation will be rebuilt and shown as `docs/docs.md`

## Shields.io Open Source Contributions
We proposed our Last Discussed on Stack Overflow badge to [Shields.io](https://github.com/badges/shields) repo
as an [issue](https://github.com/badges/shields/issues/2378) for changes to be `Number of Questions in Past Month on Stack Exchange` metric instead.
Pull Requests to make those changes include adding unit tests to existing StackExchange service, porting service from legacy API to the newest API, then finally adding badge to the Shields.io scripts itself.
* [Tests PR](https://github.com/badges/shields/pull/2414)
* [Convert API PR](https://github.com/badges/shields/pull/2418)
* [Badge Addition PR](https://github.com/badges/shields/pull/2432)
* Number of Questions in Past Month on Stack Exchange Example Badge
![Number of Questions Badge Example](https://img.shields.io/stackexchange/stackoverflow/qm/axios.svg)
		
## License
ualberta-smr/LibraryMetricsBadges is licensed under the </br>

MIT License </br>
A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code. </br>

For more details visit: [MIT License](LICENSE.md)
