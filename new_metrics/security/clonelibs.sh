#referencing: https://github.com/bui1/librarycomparisonswebsite/blob/master/scripts/breakingchanges/cloneRepo.sh
rm -rf "repos"
mkdir "repos"
cd "repos"
while IFS='' read -r line || [[ -n "$line" ]];
do  
	git clone "$line" 
done 