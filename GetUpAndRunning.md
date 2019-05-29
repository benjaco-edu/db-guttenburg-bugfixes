## Get up and running

Docker and NodeJS 12 is required

```bash
unzip booksAndCitiesComplete.json.zip

docker run -d --name mysqlGreenbug -p3306:3306 -e MYSQL_ROOT_PASSWORD=pass1234 mysql

docker exec mysqlGreenbug mysql -uroot -ppass1234 -e "CREATE USER 'nodejs'@'%' IDENTIFIED WITH mysql_native_password BY 'nodecode'; grant all privileges on *.* to 'nodejs'@'%'; FLUSH PRIVILEGES; CREATE DATABASE greenbugDb;"

docker run -d --rm -p 27017:27017 --name mongoGreenbug mongo

npm i

node buildDatabase/index.js

docker cp ./mysqlScript.sql mysqlGreenbug:mysqlScript.sql

docker exec -it mysqlGreenbug bash
> mysql -uroot -ppass1234 greenbugDb < mysqlScript.sql

> # Add index

> mysql -uroot -ppass1234
> > use greenbugDb;
> > create index i_location on Locations(name);
> > create index i_title on BookParts(title);  
> > create index i_author on BookParts(author);
> > ALTER TABLE Locations ADD SPATIAL INDEX(coordinate);

docker exec -it mongoGreenbug bash
> mongo
> > use greenbugDb;
> > db.Locations.createIndex({name:1})
> > db.Books.createIndex({id:1})
> > db.Books.createIndex({title:1})
> > db.Locations.createIndex({id:1})
> > db.Books.createIndex({author:1})
> > db.Locations.createIndex( { coordinate : "2dsphere" } )

node app/index.js
```

## clean up

```bash
docker rm -f mysqlGreenbug mongoGreenbug
```
