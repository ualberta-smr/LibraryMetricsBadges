# assuming java classes don't have to be compiled again
cd "repos"
for library in $( ls -d */ | sed 's#/##' )
do
    cd $library
    java -jar ../../spotbugs-3.1.3/lib/spotbugs.jar -textui -include ../../includefilterfile.xml -effort:max -high -pluginList ../../findsecbugs-plugin-1.8.0.jar $library > ../../bugs.txt
    cd ..
done