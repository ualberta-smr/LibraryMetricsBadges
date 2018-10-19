# Assuming java classes don't have to be compiled, run this script to get spotbugs data
# bash updatestats.sh

cd "repos" 
for library in $( ls -d */ | sed 's#/##' )
do
    cd $library
    if cat "../../numberofbugs.txt";
    then
        cat "../../numberofbugs.txt" > "../../previous_stat.txt"
    fi
    # run spotbugs with findsecbugs plugin to find all security vulnerabilities with highest confidence level
    java -jar ../../spotbugs-3.1.3/lib/spotbugs.jar -textui -include ../../includefilterfile.xml -effort:max -high -pluginList ../../findsecbugs-plugin-1.8.0.jar $library > ../../bugs.txt
    cd ..
    wc -l ../bugs.txt | grep -o "[0-9]\+" > ../numberofbugs.txt
done