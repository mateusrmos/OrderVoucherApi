dps:
	@docker ps --format "table {{.ID}}\t{{.Ports}}\t{{.Names}}"
up:
	@docker-compose up -d --build
	@make dps
restart:
	@make down
	@make up
down:
	@docker stop ordervoucher-api-php8 ordervoucher-api-mysql8 ordervoucher-api-node ordervoucher-api-rabbitmq $(shell docker ps -a -q)
chmod:
	@docker exec -it ordervoucher-api-php8 chmod -R 0777 .
migrate-up:
	@docker exec -it ordervoucher-api-php8 bin/console doct:migr:migrate
install:
	@docker exec -it ordervoucher-api-php8 composer install
	@docker exec -it ordervoucher-api-php8 bin/console doctrine:cache:clear-metadata
	@make chmod