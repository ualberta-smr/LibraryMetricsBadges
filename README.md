# Exploring Software Library Metrics with GitHub Badges 
![Security Badge](http://bd42c219.ngrok.io/security)


## Prerequisites
* Node versions 8.11.1 or above
* NPM should be bundled with the Node version above
* Lots of memory due to cloning of other open source libraries and Spotbugs necessities

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

