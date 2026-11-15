<?php

namespace App\Mcp\Tools;

use App\Http\Requests\Customers\SaveCustomerRequest;
use App\Mcp\FormRequestBridge;
use App\Models\Customer;
use App\Models\Team;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('update-customer')]
#[Title('Update customer')]
#[Description('Change a customer\'s name, email or phone. Fields you leave out keep their current value; send an empty string to clear email or phone (one of them must stay). Confirm the change with the user first.')]
#[IsIdempotent]
#[IsReadOnly(false)]
#[IsDestructive(true)]
#[IsOpenWorld(false)]
class UpdateCustomerTool extends BusinessTool
{
    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'customer_id' => $schema->integer()->description('The customer id from search-customers.')->required(),
            'name' => $schema->string()->description('New full name.'),
            'email' => $schema->string()->description('New email, or "" to remove it.'),
            'phone' => $schema->string()->description('New phone number, or "" to remove it.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $customerId = $request->validate(['customer_id' => ['required', 'integer']])['customer_id'];
        $customer = $team->customers()->find($customerId);

        if (! $customer instanceof Customer) {
            return Response::error(__('Customer not found. Use search-customers to find them.'));
        }

        $arguments = $request->all();

        $form = FormRequestBridge::validate(SaveCustomerRequest::class, $user, [
            'name' => array_key_exists('name', $arguments) ? $arguments['name'] : $customer->name,
            'email' => array_key_exists('email', $arguments) ? ($arguments['email'] ?: null) : $customer->email,
            'phone' => array_key_exists('phone', $arguments) ? ($arguments['phone'] ?: null) : $customer->phone,
        ]);

        $customer->update($form->customerData());

        return Response::structured([
            'customer' => ['id' => $customer->id, 'name' => $customer->name, 'email' => $customer->email, 'phone' => $customer->phone],
        ]);
    }
}
