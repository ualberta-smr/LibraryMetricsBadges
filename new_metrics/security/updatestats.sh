# Assuming java classes don't have to be compiled, run this script to get spotbugs data
# bash updatestats.sh

# cd "repos" 
# for library in $( ls -d */ | sed 's#/##' )
# do
#     cd $library
#     if cat "../../numberofbugs.txt";
#     then
#         cat "../../numberofbugs.txt" > "../../previous_stat.txt"
#     fi
#     # run spotbugs with findsecbugs plugin to find all security vulnerabilities with highest confidence level
#     java -jar ../../spotbugs-3.1.3/lib/spotbugs.jar -textui -include ../../includefilterfile.xml -effort:max -high -pluginList ../../findsecbugs-plugin-1.8.0.jar $library > ../../bugs.txt
#     cd ..
#     wc -l ../bugs.txt | grep -o "[0-9]\+" > ../numberofbugs.txt
# done


cd "repos" 
for library in $( ls -d */ | sed 's#/##' )
do
    cd $library
    if [[ $(git pull origin master | grep -q -v 'Already up-to-date.') ]];
    then
        if [[ $(sqlite3 ../../bugs.db "select * from bugs where libname = \"${library}\";") ]];
        then
            echo "Using previously saved stat for: \"${library}\""
        fi
            echo "Stat being newly inserted for \"${library}\""
            java -jar ../../spotbugs-3.1.3/lib/spotbugs.jar -textui -include ../../includefilterfile.xml -effort:max -high -pluginList ../../findsecbugs-plugin-1.8.0.jar ./ > "../../bugs.txt"
            newnum=$(wc -l ../../bugs.txt | grep -o "[0-9]\+")
            sqlite3 ../../bugs.db "INSERT INTO bugs (id, libname, numberofbugs, status) VALUES (NULL, \"${library}\", \"${newnum}\", '--');"
    
    else

        java -jar ../../spotbugs-3.1.3/lib/spotbugs.jar -textui -include ../../includefilterfile.xml -effort:max -high -pluginList ../../findsecbugs-plugin-1.8.0.jar ./ > "../../bugs.txt"
        updatednum=$(wc -l ../../bugs.txt | grep -o "[0-9]\+")

        if [[ $(sqlite3 ../../bugs.db "select * from bugs where libname = \"${library}\";") ]];
        then   
            echo "Updating stat for: \"${library}\""

            prevnum=$(sqlite3 ../../bugs.db "select numberofbugs from bugs where libname = \"${library}\";")

            if [ $prevnum -lt $updatednum ];
            then  
                sqlite3 ../../bugs.db "UPDATE bugs SET numberofbugs = \"${updatednum}\", status = '↑' WHERE libname = \"${library}\";"
            elif [ $prevnum -gt $updatednum ]
            then
                sqlite3 ../../bugs.db "UPDATE bugs SET numberofbugs = \"${updatednum}\", status = '↓' WHERE libname = \"${library}\";"
            else    
                sqlite3 ../../bugs.db "UPDATE bugs SET numberofbugs = \"${updatednum}\", status = '--' WHERE libname = \"${library}\";"
            fi  

        else
            echo "stat being newly inserted for \"${library}\""
            sqlite3 ../../bugs.db "INSERT INTO bugs (id, libname, numberofbugs, status) VALUES (NULL, \"${library}\", \"${updatednum}\", '--');"
        fi
    fi
    cd ..
done

