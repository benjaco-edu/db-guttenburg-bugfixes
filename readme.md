## Get up and running


```bash
unzip booksAndCitiesComplete.json.zip

docker run -d --name mysqlGreenbug -p3306:3306 -e MYSQL_ROOT_PASSWORD=pass1234 mysql

docker exec mysqlGreenbug mysql -uroot -ppass1234 -e "CREATE USER 'nodejs'@'%' IDENTIFIED WITH mysql_native_password BY 'nodecode'; grant all privileges on *.* to 'nodejs'@'%'; FLUSH PRIVILEGES; CREATE DATABASE greenbugDb;"

docker run -d --rm -p 27017:27017 --name mongoGreenbug mongo

node buildDatabase/index.js

docker cp ./mysqlScript.sql mysqlGreenbug:mysqlScript.sql

docker exec -it mysqlGreenbug bash
> mysql -uroot -ppass1234 greenbugDb < mysqlScript.sql

npm i
node app/index.js
```

Obs, no indexes created, do it in the application

## clean up

```bash
docker rm -f mysqlGreenbug mongoGreenbug
```