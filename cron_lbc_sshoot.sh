#!/bin/bash
path="/home/ludovic/lbc_sshoot"
incoming_urls_path="/url2screenshoot/incoming/url.list"
today=`date +"%Y%m%d-%H%M%S-%3N"`
processing_urls_path="/url2screenshoot/processing/"
done_urls_path="/url2screenshoot/done/"
phantomjs_script="/lbc.js"

if [ ! -f "$path$incoming_urls_path" ]; then 
	echo "no url file : $path$incoming_urls_path"
	echo "waiting for next run"
	exit 0
fi

#echo $path$urls_path
#echo $path$processing_urls_path
#echo $path$done_urls_path

if [ ! -d "$path$processing_urls_path" ]; then
	mkdir -p $path$processing_urls_path
fi

echo "mv $path$incoming_urls_path $path$processing_urls_path$today"
mv $path$incoming_urls_path $path$processing_urls_path$today

while read line
do
	echo "screen shooting : $line"
	phantomjs $path$phantomjs_script $line
done < $path$processing_urls_path$today

if [ ! -d "$path$done_urls_path" ]; then
        mkdir -p $path$done_urls_path
fi

mv $path$processing_urls_path$today $path$done_urls_path$today

