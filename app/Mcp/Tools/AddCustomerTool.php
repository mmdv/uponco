<?php

namespace App\Mcp\Tools;

use App\Http\Requests\Customers\SaveCustomerRequest;
use App\Mcp\FormRequestBridge;
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
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('add-customer')]
#[Title('Add customer')]
#[Description('Add a customer to the business, as on the Customers page: a name plus an email and/or phone number. Run search-customers first so you do not create a duplicate. Nobody is emailed.')]
#[IsReadOnly(false)]
#[IsDestructive(false)]
#[IsOpenWorld(false)]
class AddCustomerTool extends BusinessTool
{
    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('Full name.')->required(),
            'email' => $schema->string()->format('email')->description('Email address. Email or phone is required.'),
            'phone' => $schema->string()->description('Phone number, ideally with the country code. Email or phone is required.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $form = FormRequestBridge::validate(SaveCustomerRequest::class, $user, [
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'phone' => $request->get('phone'),
        ]);

        $customer = $team->customers()->create($form->customerData());

        return Response::structured([
            'customer' => ['id' => $customer->id, 'name' => $customer->name, 'email' => $customer->email, 'phone' => $customer->phone],
        ]);
    }
}
