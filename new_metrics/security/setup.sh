# Runs through entire process of git cloning libaries from a text file,
# compiling each Java library
# and running spotbugs and storing result into the database

#/bin/bash
bash clonelibs.sh < repositories.txt
bash compilelibs.sh
bash updatestats.sh
