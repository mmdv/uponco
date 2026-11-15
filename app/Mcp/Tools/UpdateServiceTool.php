<?php

namespace App\Mcp\Tools;

use App\Models\Service;
use App\Models\Team;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('update-service')]
#[Title('Update service')]
#[Description('Change a service: price, duration, description, who offers it and where, or set is_active false to stop new bookings. Owners and admins only. Fields you leave out keep their current value; location_ids and specialist_ids replace the whole list. Existing appointments are not changed. Confirm the change with the user first.')]
#[IsIdempotent]
#[IsReadOnly(false)]
#[IsDestructive(true)]
#[IsOpenWorld(false)]
class UpdateServiceTool extends ServiceChangeTool
{
    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'service_id' => $schema->integer()->description('The service id from get-business-overview.')->required(),
            ...$this->serviceSchema($schema),
        ];
    }

    protected function existingService(Request $request, Team $team): Service|Response|null
    {
        $serviceId = $request->validate(['service_id' => ['required', 'integer']])['service_id'];

        return $team->services()->find($serviceId)
            ?? Response::error(__('Service not found. Use get-business-overview for the list of services.'));
    }
}
