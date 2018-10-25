# Exploring Software Library Metrics with GitHub Badges 
![Security Badge](http://bd42c219.ngrok.io/security)
![Release Frequency Badge](https://img.shields.io/badge/dynamic/json.svg?label=ReleaseDays&url=http%3A%2F%2Fafd7b0a1.ngrok.io%2Freleasefreq%3Fowner%3Dgson%26libname%3Dgson&query=numdays)

## Prerequisites
* Node versions 8.11.1 or above
* NPM should be bundled with the Node version above (at least 5.6.0)
* Lots of memory due to cloning of other open source libraries and Spotbugs necessities
* Java version 8 (but some git cloning of libraries may need version 9 or 10 instead)

## Environment Setup
* Clone repository
* Inside of root folder of repo, run `npm install` to grab necessary dependencies

## Folder Structure
* existing_metrics
	* Will contain files from Fernando's repo
	* last_discussed
	* issue_response_time
	* release_freq
* new_metrics
	* security
		* **CURRENTLY** -> Badge image is given from running a localhost/ngrok server
			* Bash script dynamic update is too slow when a browser hits our badge endpoint
		* add any Java, public Github repository clone link to `repositories.txt`
		* To update stat given that library has been compiled already:
			* run `bash updatestats.sh`
		* To go through entire process of git cloning, Maven/Gradle compilation, then running SpotBugs
			* run `bash clonelibs.sh < repositories.txt`, then `bash compilelibs.sh`, finally `bash updatestats.sh`
	* pull_requests

