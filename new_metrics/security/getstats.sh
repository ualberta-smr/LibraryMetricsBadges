#/bin/bash

# #referencing: https://github.com/bui1/librarycomparisonswebsite/blob/master/scripts/breakingchanges/cloneRepo.sh
rm -rf "repos"
mkdir "repos"
cd "repos"
while read line 
do  
	git clone "$line" 
done < $1

# after clone,
# need to go to every directory and detect if pom.xml or grade.build file
# if pom.xml
    # mvn clean install -DskipTests=true
# else
    # gradle build -x test

for library in ls -d */; do
    check = "$(find "$library" -maxDepth 1 -type f -name 'pom.xml' -printf .)"
    cd library
    if [$check -eq 1]
    then    
        mvn clean install -DskipTests=true
    else
        gradle build -x test
    fi
    cd ..
done


# after compiling all java classes need to run spotbugs for every library inside of the repos folder
# while running grab the number generated inside of: Warnings generated: SOMENUM
# then save number into another txt file for later

