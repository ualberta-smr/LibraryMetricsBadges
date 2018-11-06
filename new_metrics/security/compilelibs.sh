# Script goes through each cloned Java library in your repos folder
# and either does a Maven or Gradle compilation 

# References
# ----------------------------
# Remove trailing slashes when listing directories -> SuperUser, Stack Exchange
# https://superuser.com/a/674004
# Author: Teun Vink https://superuser.com/users/270767/teun-vink
# user contributions licensed under cc by-sa 3.0 with attribution required. rev 2018.11.5.32076

# Find specific file in directory
# https://stackoverflow.com/a/5927391
# Author: Mat https://stackoverflow.com/users/635608/mat
# user contributions licensed under cc by-sa 3.0 with attribution required. rev 2018.11.5.32076

#/bin/bash
cd "repos"
for library in $( ls -d */ | sed 's#/##' )
do
    if [[ $(find $library -maxdepth 1 -type f -name "pom.xml") ]];
    then    
        cd $library
        mvn clean install -q -DskipTests=true 
    else
        cd $library
        gradle build -q -x test
    fi
    cd ..
done

