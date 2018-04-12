tarball="https://zenodo.org/record/1196312/files/Libraries.io-open-data-1.2.0.tar.gz"
csvfile="repository_dependencies-1.2.0-2018-03-12.csv"
curl $tarball | tar xvz
head -n 1 $csvfile > electron.csv
cat $csvfile | grep ",electron," >> electron.csv