<?php

namespace App\Service;

use App\Constants\AppConstants;
use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;

class OrderService
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @var VoucherService
     */
    private $voucherService;

    public function __construct(EntityManagerInterface $em, LoggerInterface $logger, VoucherService $voucherService)
    {
        $this->em = $em;
        $this->logger = $logger;
        $this->voucherService = $voucherService;
    }

    public function createOrder(Order $order): Order
    {
        try {
            $order->setStatus(AppConstants::ORDER_STATUS_PROCESSING);
            $order->setHasVoucher(false);
            $this->em->persist($order);
            $this->em->flush();
            $this->logger->info('Order created successfully - id: ' . $order->getId());
            $voucher = $this->voucherService->createVoucher($order->getAmount(), $order->getId(), $order->getUserId());
            $order->setStatus(AppConstants::ORDER_STATUS_SUCCEEDED);
            $this->em->persist($order);
            $this->em->flush();
            $this->logger->info('Order updated, voucher info: ' . json_encode($voucher));
        } catch (Exception $ex) {
            $order->setStatus(AppConstants::ORDER_STATUS_ERROR);
            $order->setHasVoucher(false);
            $this->em->persist($order);
            $this->em->flush();
            $this->logger->error('Error while creating order - Detail: ' . $ex->getMessage());
        } finally {
            return $order;
        }
    }

    public function updateVoucher(Order $order): Order
    {
        try {
            $this->em->persist($order);
            $this->em->flush();
            $this->logger->info('Order voucher updated successfully - id: ' . $order->getId());
        } catch (Exception $ex) {
            $this->logger->error('Error while updating order voucher - Detail: ' . $ex->getMessage());
        } finally {
            return $order;
        }
    }
}
