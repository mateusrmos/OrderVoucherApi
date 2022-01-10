<?php

namespace App\Service;

use OldSound\RabbitMqBundle\RabbitMq\AMQPConnectionFactory;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Connection\AMQPStreamConnection;


class RabbitMQService
{
    /**
     * @var string
     */
    private $rq_host;

    /**
     * @var string
     */
    private $rq_port;

    /**
     * @var string
     */
    private $rq_user;

    /**
     * @var string
     */
    private $rq_pass;

    public function __construct()
    {
        $this->rq_host = getenv('RMQ_HOST');
        $this->rq_port = getenv('RMQ_PORT');
        $this->rq_user = getenv('RMQ_USER');
        $this->rq_pass = getenv('RMQ_PWD');
    }

    private function getConnection(): AMQPStreamConnection
    {
        return new AMQPStreamConnection($this->rq_host, $this->rq_port, $this->rq_user, $this->rq_pass);
    }

    public function publishMessage(string $queueName, array $payload)
    {
        $connection = $this->getConnection();
        $message = new AMQPMessage(json_encode($payload));

        $channel = $connection->channel();
        $channel->queue_declare($queueName, false, true, false, false);
        $channel->basic_publish($message, '', $queueName);
        $channel->close();
        $connection->close();
    }
}
