<?php

namespace App\Service;

use App\Constants\AppConstants;
use App\Entity\Order;
use App\Repository\OrderRepository;
use Exception;
use Psr\Log\LoggerInterface;

class OrderService
{

    /**
     * @var OrderRepository
     */
    private $orderRepository;

    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @var VoucherService
     */
    private $voucherService;

    public function __construct(OrderRepository $orderRepository, LoggerInterface $logger, VoucherService $voucherService)
    {
        $this->orderRepository = $orderRepository;
        $this->logger = $logger;
        $this->voucherService = $voucherService;
    }

    public function createOrder(Order $order): Order
    {
        try {
            $order->setStatus(AppConstants::ORDER_STATUS_PROCESSING);
            $order->setHasVoucher(false);
            $this->orderRepository->create($order);
            $this->logger->info('Order created successfully - id: ' . $order->getId());
            $this->voucherService->createVoucher($order->getAmount(), $order->getId(), $order->getUserId());
            $order->setStatus(AppConstants::ORDER_STATUS_SUCCEEDED);
            $this->orderRepository->update($order);
            $this->logger->info('Order updated, voucher issued');
        } catch (Exception $ex) {
            $order->setStatus(AppConstants::ORDER_STATUS_ERROR);
            $order->setHasVoucher(false);
            $this->orderRepository->update($order);
            $this->logger->error('Error while creating order - Detail: ' . $ex->getMessage());
        } finally {
            return $order;
        }
    }

    public function updateVoucher(Order $order, bool $hasVoucher): Order
    {
        try {
            $order->setHasVoucher($hasVoucher);
            $this->orderRepository->update($order);
            $this->logger->info('Order voucher updated successfully - id: ' . $order->getId());
        } catch (Exception $ex) {
            $this->logger->error('Error while updating order voucher - Detail: ' . $ex->getMessage());
        } finally {
            return $order;
        }
    }
}
