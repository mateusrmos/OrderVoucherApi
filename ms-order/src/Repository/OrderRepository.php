<?php

namespace App\Repository;

use App\Entity\Order;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Order|null find($id, $lockMode = null, $lockVersion = null)
 * @method Order|null findOneBy(array $criteria, array $orderBy = null)
 * @method Order[]    findAll()
 * @method Order[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OrderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Order::class);
    }

    /**
     * @param Order $order
     * @return Order
     */
    public function create(Order $order): Order
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($order);
        $entityManager->flush();
        return $order;
    }

    /**
     * @param Order $order
     * @return Order
     */
    public function update(Order $order): Order
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($order);
        return $order;
    }
}
