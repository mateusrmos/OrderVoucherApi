<?php

namespace App\Controller;

use App\Entity\Order;
use App\Response\ApiResponse;
use App\Service\OrderService;
use App\Validator\OrderRules;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class OrderController extends AbstractController
{
    /**
     * @var ValidatorInterface
     */
    private $validator;

    /**
     * @var OrderService
     */
    private $orderService;

    /**
     * @var SerializerInterface
     */
    private $serializer;

    public function __construct(
        ValidatorInterface $validator,
        OrderService $orderService,
        SerializerInterface $serializer
    ) {
        $this->validator = $validator;
        $this->orderService = $orderService;
        $this->serializer = $serializer;
    }

    private function violationsToArray(ConstraintViolationListInterface $violations)
    {
        $messages = [];

        foreach ($violations as $constraint) {
            $prop = $constraint->getPropertyPath();
            $messages[$prop][] = $constraint->getMessage();
        }

        return $messages;
    }

    private function toArray($data, array $groups = []): array
    {
        $context = new SerializationContext();
        $context->setSerializeNull(true);
        if (\count($groups)) {
            $context->setGroups($groups);
        }

        return $this->serializer->toArray($data, $context);
    }

    #[Route('/order', name: 'create_order', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $violations = $this->validator->validate($request->request->all(), OrderRules::create());
        if (count($violations)) {
            return new ApiResponse(null, $this->violationsToArray($violations), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        $orderObj = new Order();
        $orderObj->setAmount($request->get('amount'));
        $orderObj->setUserId($request->get('userId'));
        return new ApiResponse($this->toArray($this->orderService->createOrder($orderObj), ['create']), Response::HTTP_CREATED);
    }

    #[Route('/order/{order}', name: 'update_order', methods: ['PUT'])]
    public function update(Request $request, Order $order): JsonResponse
    {
        $violations = $this->validator->validate($request->request->all(), OrderRules::updateVoucher());
        if (count($violations)) {
            return new ApiResponse(null, $this->violationsToArray($violations), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        $order->setHasVoucher($request->get('hasVoucher'));
        return new ApiResponse($this->toArray($this->orderService->updateVoucher($order), ['voucher']));
    }
}
