<?php

namespace App\Response;

use Symfony\Component\HttpFoundation\JsonResponse;

class ApiResponse extends JsonResponse
{
    /**
     * @throws \InvalidArgumentException When the HTTP status code is not valid
     */
    public function __construct($data = null, $error = null, int $status = 200, array $headers = array())
    {
        $content = [
            'data' => $data,
            'error' => $error,
        ];
        parent::__construct($content, $status, $headers);
    }
}
