dps:
	@docker ps --format "table {{.ID}}\t{{.Ports}}\t{{.Names}}"
up:
	@docker-compose up -d --build
	@make dps
restart:
	@make down
	@make up
down:
	@docker stop real-digital-php8 real-digital-mysql8 real-digital-node real-digital-rabbitmq $(shell docker ps -a -q)
chmod:
	@docker exec -it real-digital-php8 chmod -R 0777 .
migrate-up:
	@docker exec -it real-digital-php8 bin/console doct:migr:migrate
install:
	@docker exec -it real-digital-php8 composer install
	@docker exec -it real-digital-php8 bin/console doctrine:cache:clear-metadata
	@make chmod