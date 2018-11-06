# Script runs Spotbugs for every java library that has been cloned and compiled on your local machine
# Assuming java classes don't have to be compiled, run this script to get spotbugs data and
# it will store it within database
# bash updatestats.sh


# References
# --------------------------------
# Counting number of lines in file using wc -l -> Stack Overflow
# https://stackoverflow.com/a/3137099 
# Author: user85509 https://stackoverflow.com/users/85509/user85509
# user contributions licensed under cc by-sa 3.0 with attribution required. rev 2018.11.5.32076

# Remove trailing slashes when listing directories -> SuperUser, Stack Exchange
# https://superuser.com/a/674004
# Author: Teun Vink https://superuser.com/users/270767/teun-vink
# user contributions licensed under cc by-sa 3.0 with attribution required. rev 2018.11.5.32076

#/bin/bash
cd "repos" 
for library in $( ls -d */ | sed 's#/##' )
do
    cd $library
    if [[ $(git pull origin master | grep -q -v 'Already up-to-date.') ]];
    then
        if [[ $(sqlite3 ../../../../badges.db  "select * from bugs where libname = \"${library}\";") ]];
        then
            echo "Using previously saved stat for: \"${library}\""
        else
            echo "Stat being newly inserted for \"${library}\""
            java -jar ../../spotbugs-3.1.3/lib/spotbugs.jar -textui -include ../../includefilterfile.xml -effort:max -high -pluginList ../../findsecbugs-plugin-1.8.0.jar ./ > "../../bugs.txt"
            newnum=$(wc -l ../../bugs.txt | grep -o "[0-9]\+")
            sqlite3 ../../../../badges.db "INSERT INTO bugs (libname, numberofbugs, status) VALUES (\"${library}\", \"${newnum}\", '--');"
        fi
    else

        java -jar ../../spotbugs-3.1.3/lib/spotbugs.jar -textui -include ../../includefilterfile.xml -effort:max -high -pluginList ../../findsecbugs-plugin-1.8.0.jar ./ > "../../bugs.txt"
        updatednum=$(wc -l ../../bugs.txt | grep -o "[0-9]\+")

        if [[ $(sqlite3 ../../../../badges.db  "select * from bugs where libname = \"${library}\";") ]];
        then   
            echo "Updating stat for: \"${library}\""

            prevnum=$(sqlite3 ../../../../badges.db "select numberofbugs from bugs where libname = \"${library}\";")

            if [ $prevnum -lt $updatednum ];
            then  
                sqlite3 ../../../../badges.db "UPDATE bugs SET numberofbugs = \"${updatednum}\", status = '↑' WHERE libname = \"${library}\";"
            elif [ $prevnum -gt $updatednum ]
            then
                sqlite3 ../../../../badges.db "UPDATE bugs SET numberofbugs = \"${updatednum}\", status = '↓' WHERE libname = \"${library}\";"
            else    
                sqlite3 ../../../../badges.db "UPDATE bugs SET numberofbugs = \"${updatednum}\", status = '--' WHERE libname = \"${library}\";"
            fi  

        else
            echo "stat being newly inserted for \"${library}\""
            sqlite3 ../../../../badges.db "INSERT INTO bugs (libname, numberofbugs, status) VALUES (\"${library}\", \"${updatednum}\", '--');"
        fi
    fi
    cd ..
done

