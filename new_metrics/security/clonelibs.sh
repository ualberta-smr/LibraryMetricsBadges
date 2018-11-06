# How to clone libraries from git from a file line by line
# https://github.com/bui1/librarycomparisonswebsite/blob/master/scripts/breakingchanges/cloneRepo.sh
# Author: Fernando López de la Mora https://github.com/flopezde

rm -rf "repos"
mkdir "repos"
cd "repos"
while IFS='' read -r line || [[ -n "$line" ]];
do  
	git clone "$line" 
done 