<?php

namespace App\Entity;

use App\Repository\OrderRepository;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as JMS;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: '`order`')]
#[ORM\HasLifecycleCallbacks()]
class Order
{
    /**
     * @var int
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: 'integer')]
    #[JMS\Groups(['create', 'voucher'])]
    private $id;

    /**
     * @var float
     */
    #[ORM\Column(name: 'amount', type: 'float')]
    #[JMS\Groups(['create'])]
    private $amount;

    /**
     * @var int
     */
    #[ORM\Column(name: 'userId', type: 'integer')]
    #[JMS\Groups(['create'])]
    private $userId;

    /**
     * @var bool
     */
    #[ORM\Column(name: 'has_voucher', type: 'boolean')]
    #[JMS\Groups(['voucher'])]
    private $hasVoucher;

    #[ORM\Column(name: 'status', type: 'string', length: 10)]
    #[JMS\Groups(['create'])]
    private $status;

    /**
     * @var \DateTime
     */
    #[ORM\Column(name: 'created_at', type: 'datetime')]
    #[JMS\Groups(['create'])]
    private $createdAt;

    /**
     * @var \DateTime
     */
    #[ORM\Column(name: 'updated_at', type: 'datetime')]
    #[JMS\Groups(['create', 'voucher'])]
    private $updatedAt;


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): self
    {
        $this->amount = $amount;

        return $this;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): self
    {
        $this->userId = $userId;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }
    public function getHasVoucher(): ?bool
    {
        return $this->hasVoucher;
    }

    public function setHasVoucher(bool $hasVoucher): self
    {
        $this->hasVoucher = $hasVoucher;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Gets triggered only on insert
     */
    #[ORM\PrePersist()]
    public function onPrePersist(): void
    {
        if (!$this->createdAt) {
            $this->createdAt = new \DateTime('now');
        }
    }

    /**
     * Gets triggered every time on update
     */
    #[ORM\PreUpdate()]
    #[ORM\PrePersist()]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTime('now');
    }
}
