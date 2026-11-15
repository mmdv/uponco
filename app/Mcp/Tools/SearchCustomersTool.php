<?php

namespace App\Mcp\Tools;

use App\Models\Customer;
use App\Models\Team;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
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

#[Name('search-customers')]
#[Title('Search customers')]
#[Description('Find the business\'s customers by part of their name, email or phone number. Returns up to 20 matches, sorted by name. Use the id with list-appointments to see a customer\'s bookings.')]
#[IsIdempotent]
#[IsReadOnly]
#[IsDestructive(false)]
#[IsOpenWorld(false)]
class SearchCustomersTool extends BusinessTool
{
    protected const LIMIT = 20;

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()->min(2)->description('Part of a name, email or phone number.')->required(),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $search = trim($request->validate(['query' => ['required', 'string', 'min:2', 'max:100']])['query']);

        // Same matching as the Customers page.
        $matches = $team->customers()
            ->where(function (Builder $query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->orderBy('id')
            ->limit(self::LIMIT + 1)
            ->get();

        return Response::structured([
            'customers' => $matches->take(self::LIMIT)->map(fn (Customer $customer): array => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
            ])->values()->all(),
            // True when there are more matches than shown: ask for a narrower search.
            'more_results' => $matches->count() > self::LIMIT,
        ]);
    }
}
