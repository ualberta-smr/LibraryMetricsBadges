## Overall Framework
This is a JavaScript application using NodeJS server features.
When a user hits an endpoint e.g http://XXXXXXXX.ngrok.io/classifyusers?owner=google&libname=gson, the backend will calculate the metric using
various APIs/libraries such as Github API.
Once calculation of metric is done, the endpoint will return a JSON response. 
The client will then take the key from the key:value pair and insert it
as a query for a dynamic badge in Shields.io as shown in README.md.

## Details Per Badge
### Security
* We run Spotbugs (static analysis tool to detect bugs) and FindSecBugs (large dataset of security bug patterns)
against any Java library to output the number of security bugs found
* Filtered for security bugs at the highest confidence level

### PR
* Classify users if they are outside contributors if they have < 10% commits in repo
* Calculate average using all merged PRs / all PRs all associated with outside contributors

### Last Discussed on Stack Overflow
* Using StackExchange API filtered for Stack Overflow
* Get most popular tag associated with the library's name
* Search for the most recent question containing the popular tag
* Return the retrieved date

### Release Frequency
* Uing Github API get all commits associated with a release
* With the commit, we can grab the date of the commit
* Get average of all the dates day differences over number of releases

### Issue Response Time
* Make Github API call on all issues and check if they have at least comment
* If so, check if the author of the first comment is different then the creator of the issue
* Grab average of all issues that fall under the above condition over
all issues