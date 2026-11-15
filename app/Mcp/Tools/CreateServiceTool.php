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
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('create-service')]
#[Title('Create service')]
#[Description('Add a service customers can book. Owners and admins only. Needs a title, duration and price type; in-person (onsite) services need at least one location, and nobody can book it until specialist_ids lists who offers it. Confirm the details with the user first.')]
#[IsReadOnly(false)]
#[IsDestructive(false)]
#[IsOpenWorld(false)]
class CreateServiceTool extends ServiceChangeTool
{
    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        $fields = $this->serviceSchema($schema);

        foreach (['title', 'duration_minutes', 'price_type'] as $required) {
            $fields[$required] = $fields[$required]->required();
        }

        return $fields;
    }

    protected function existingService(Request $request, Team $team): Service|Response|null
    {
        return null;
    }
}
