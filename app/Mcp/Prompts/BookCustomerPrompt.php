<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Name('book-customer')]
#[Title('Book a customer')]
#[Description('Find a free time for a customer and book it in Uponco, after you confirm.')]
class BookCustomerPrompt extends Prompt
{
    /**
     * @return array<int, Argument>
     */
    public function arguments(): array
    {
        return [
            new Argument('customer', 'The customer\'s name, phone or email.', required: true),
            new Argument('service', 'The service they want.', required: true),
            new Argument('when', 'When they would like to come, e.g. "Friday afternoon". Defaults to the next free time.'),
        ];
    }

    public function handle(Request $request): Response
    {
        $customer = trim((string) $request->get('customer'));
        $service = trim((string) $request->get('service'));
        $when = trim((string) $request->get('when')) ?: 'the next free time';

        return Response::text(<<<TEXT
            Book {$customer} for {$service}, {$when}, in Uponco.

            1. Call get-account, then get-business-overview to find the service and who offers it.
            2. Call search-customers for "{$customer}". If there are several matches, ask me which one; if there is none, ask for their phone or email to add them.
            3. Call find-available-slots for that service around {$when} and offer me up to three times.
            4. When I pick one, repeat the customer, service, specialist, day and time, and book it only after I confirm. Tell me whether the customer was emailed.
            TEXT);
    }
}
