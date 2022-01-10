<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\Constraints\Collection;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Type;

/**
 * @Annotation
 */
class OrderRules extends Constraint
{
    /*
     * Any public properties become valid options for the annotation.
     * Then, use these in your validator class.
     */
    public $message = 'The value "{{ value }}" is not valid.';

    /**
     *
     * @return Collection
     * @throws \Symfony\Component\Validator\Exception\MissingOptionsException
     * @throws \Symfony\Component\Validator\Exception\InvalidOptionsException
     * @throws \Symfony\Component\Validator\Exception\ConstraintDefinitionException
     */
    public static function create(): Collection
    {
        return new Collection([
            'fields' => [
                'userId' => [
                    new NotBlank([
                        'message' => 'validationNotBlank'
                    ]),
                ],
                'amount' => [
                    new Type('numeric'),
                    new NotBlank([
                        'message' => 'validationNotBlank'
                    ]),
                ],
            ],
            'missingFieldsMessage' => 'validationMissingField',
            'extraFieldsMessage' => 'validationExtraField',
        ]);
    }

    /**
     *
     * @return Collection
     * @throws \Symfony\Component\Validator\Exception\MissingOptionsException
     * @throws \Symfony\Component\Validator\Exception\InvalidOptionsException
     * @throws \Symfony\Component\Validator\Exception\ConstraintDefinitionException
     */
    public static function updateVoucher(): Collection
    {
        return new Collection([
            'fields' => [
                'hasVoucher' => [
                    new Type('bool', 'validationNotBoolean'),
                ],
            ],
            'missingFieldsMessage' => 'validationMissingField',
            'extraFieldsMessage' => 'validationExtraField',
        ]);
    }
}
