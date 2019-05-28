## Get up and running

Copy in booksAndCitiesComplete.json into to root of the project

```bash

docker run -d --name mysql01 -p3306:3306 -e MYSQL_ROOT_PASSWORD=pass1234 mysql

docker exec mysql01 mysql -uroot -ppass1234 -e "CREATE USER 'nodejs'@'%' IDENTIFIED WITH mysql_native_password BY 'nodecode'; grant all privileges on *.* to 'nodejs'@'%'; FLUSH PRIVILEGES;"

docker run -d --rm -p 27017:27017 --name dbms mongo

node buildDatabase/indes.js

docker cp ./someFile.txt mysql01:/someFile.txt

docker exec mysql01 bash -c "mysql -uroot -ppass1234 greenbugDb < someFile.txt"

docker exec mysql01 mysql -uroot -ppass1234 -e "create index i_location on Locations(name); create index i_title on BookParts(title);  create index i_author on BookParts(author); ALTER TABLE Locations ADD SPATIAL INDEX(coordinate);"

docker exec mysql01 dbms mongo --eval "db.Locations.createIndex({name:1}); db.Books.createIndex({id:1}); db.Books.createIndex({title:1}); db.Locations.createIndex({id:1}); db.Books.createIndex({author:1}); db.Locations.createIndex( { coordinate : '2dsphere' } );"


node i
node app/index.js
```

