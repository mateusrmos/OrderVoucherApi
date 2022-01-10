# OrderVoucherApi

OrderVoucherApi is a REST API made using [Symfony](https://symfony.com/) that process Orders and Vouchers.

## Installation

To configure environment variables you will use the .env files.

To install you will need to have [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/), then when you pull this project go to it's root folder and run the following commands.

```bash
make up
make install
```

Then you will need to create the application databases. 
>To log in the database, the host is: `localhost`, the user is: `root` and the password is: `tiger`

```sql
CREATE DATABASE voucherDB;
CREATE DATABASE orderDB;
```

Then you will need to restart the server:
```bash
make restart
```

Then you will need to migrate the application `orderDB` database:
```bash
make migrate-up
```

## Usage
|  PATH| HTTP METHOD| Description|
| --------------- | ----- | ------------------- |
| localhost/api/order      | POST  | Create new Order |
| localhost:5050/api/vouchers   | GET  | Get vouchers list |


## Request Examples
### POST localhost/api/order[CREATEORDER]
```json
{
	"amount": 95.26,
	"userId": 6
}
```
### GET localhost/api/vouchers[LISTVOUCHERS]

## Responses

* When successfully it will return code 200 or 201
* When not found it will return code 404
* When the request isn't valid it will return code 500
* When it's a create request it returns the id and detail about the request


## Docker
* In this project we are using docker.
* In the containers we have php, symfony, rabbitmq, nodejs, express
### Containers and Ports
* webserver(php 8) - Port 80
* database(mysql 8) - Port 3306
* rabbitmq - Port 5672
* nodejs(12.18.4) - Port 5050
## Postman

If you want to use [POSTMAN](https://www.postman.com/) to perform the API calls.
Here is one [example with a collection](OrderVoucherApi.postman_collection.json) to import.