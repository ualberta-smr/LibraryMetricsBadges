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

