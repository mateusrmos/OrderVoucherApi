<?php

namespace App\Service;

use Exception;

class VoucherService
{

    /**
     * @var string
     */
    private $voucherServiceUrl;

    /**
     * @var RabbitMQService
     */
    private $rabbitMQService;

    public function __construct(RabbitMQService $rabbitMQService)
    {
        $this->voucherServiceUrl = getenv('VOUCHER_SERVICE_URL');
        $this->voucherServiceToken = getenv('VOUCHER_SERVICE_TOKEN');
        $this->rabbitMQService = $rabbitMQService;
    }

    public function createVoucher($amount, $orderId, $userId): void
    {
        $this->rabbitMQService->publishMessage(
            'VOUCHER_QUEUE',
            ['amount' => $amount, 'orderId' => $orderId, 'userId' => $userId]
        );
    }
}
