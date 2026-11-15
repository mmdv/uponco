<?php

namespace App\Mcp\Tools;

use App\Actions\Services\SaveService;
use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Enums\TeamRole;
use App\Http\Requests\Services\SaveServiceRequest;
use App\Mcp\FormRequestBridge;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;

/**
 * Creates or edits a service through the Services page's own request and
 * action, so prices, delivery and group rules are validated exactly as there.
 * Owners and admins only, as on the web.
 */
abstract class ServiceChangeTool extends BusinessTool
{
    public function __construct(protected SaveService $saveService) {}

    /**
     * The service to edit, or null to create one. Returns a Response to stop
     * with an error.
     */
    abstract protected function existingService(Request $request, Team $team): Service|Response|null;

    /**
     * The fields both tools take. None is required here; creating checks its
     * own required fields.
     *
     * @return array<string, mixed>
     */
    protected function serviceSchema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('Service name shown to customers.'),
            'description' => $schema->string()->description('Short description shown on the booking page.'),
            'duration_minutes' => $schema->integer()->min(1)->max(1440)->description('How long it takes.'),
            'price_type' => $schema->string()->enum(array_column(PriceType::cases(), 'value'))->description('fixed (one price), range (from–to) or free.'),
            'price' => $schema->number()->description('The price, for price_type fixed.'),
            'price_min' => $schema->number()->description('Lowest price, for price_type range.'),
            'price_max' => $schema->number()->description('Highest price, for price_type range.'),
            'currency' => $schema->string()->enum(array_column(Currency::cases(), 'value'))->description('Price currency.'),
            'delivery_type' => $schema->string()->enum(array_column(DeliveryType::cases(), 'value'))->description('onsite (needs location_ids) or online.'),
            'service_type' => $schema->string()->enum(array_column(ServiceType::cases(), 'value'))->description('individual (one customer) or group (several, up to capacity).'),
            'capacity' => $schema->integer()->min(1)->description('Seats per session, for group services.'),
            'is_active' => $schema->boolean()->description('False hides it from booking.'),
            'location_ids' => $schema->array()->items($schema->integer())->description('Where it is offered (ids from get-business-overview). Replaces the current list.'),
            'specialist_ids' => $schema->array()->items($schema->integer())->description('Who offers it (ids from get-business-overview). Replaces the current list.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        if (! ($user->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false)) {
            return Response::error(__('Only owners and admins can change services.'));
        }

        $service = $this->existingService($request, $team);

        if ($service instanceof Response) {
            return $service;
        }

        $form = FormRequestBridge::validate(
            SaveServiceRequest::class,
            $user,
            $this->payload($request->all(), $service),
            $service ? ['service' => $service] : [],
        );

        $saved = $this->saveService->handle($form, $service);

        return Response::structured([
            'saved' => true,
            'service' => $this->serviceData($saved->refresh()->load(['locations:id', 'specialists:id'])),
        ]);
    }

    /**
     * The form's fields: the service's current values (or the defaults for a
     * new one) with the arguments the assistant sent on top. Specialists'
     * own price and duration overrides are carried over untouched.
     *
     * @param  array<string, mixed>  $arguments
     * @return array<string, mixed>
     */
    protected function payload(array $arguments, ?Service $service): array
    {
        $current = $service === null ? [
            'is_active' => true,
            'technical_break' => 0,
            'service_type' => ServiceType::Individual->value,
            'delivery_type' => DeliveryType::Onsite->value,
            'location_ids' => [],
            'user_ids' => [],
            'specialist_pricing' => [],
        ] : [
            'service_category_id' => $service->service_category_id,
            'is_active' => $service->is_active,
            'title' => $service->title,
            'description' => $service->description,
            'price_type' => $service->price_type->value,
            'price' => $service->price,
            'price_min' => $service->price_min,
            'price_max' => $service->price_max,
            'currency' => $service->currency->value,
            'duration' => $service->duration,
            'technical_break' => $service->technical_break,
            'slot_interval' => $service->slot_interval,
            'service_type' => $service->service_type->value,
            'delivery_type' => $service->delivery_type->value,
            'online_meeting_provider' => $service->online_meeting_provider,
            'capacity' => $service->capacity,
            'location_ids' => $service->locations()->pluck('locations.id')->all(),
            'user_ids' => $service->specialists()->pluck('users.id')->all(),
            'specialist_pricing' => $service->specialists()->get()
                ->mapWithKeys(fn (User $specialist): array => [$specialist->id => [
                    'duration' => $specialist->pivot->duration,
                    'price' => $specialist->pivot->price,
                    'price_min' => $specialist->pivot->price_min,
                    'price_max' => $specialist->pivot->price_max,
                ]])
                ->all(),
        ];

        $renamed = ['duration_minutes' => 'duration', 'specialist_ids' => 'user_ids'];

        foreach ($arguments as $key => $value) {
            if (array_key_exists($key, $this->serviceSchemaKeys())) {
                $current[$renamed[$key] ?? $key] = $value;
            }
        }

        // An online service needs a meeting provider; Google Meet is what the
        // Services page suggests first.
        if (($current['delivery_type'] ?? null) === DeliveryType::Online->value && blank($current['online_meeting_provider'] ?? null)) {
            $current['online_meeting_provider'] = 'google_meet';
        }

        return $current;
    }

    /**
     * @return array<string, true>
     */
    protected function serviceSchemaKeys(): array
    {
        return array_fill_keys([
            'title', 'description', 'duration_minutes', 'price_type', 'price', 'price_min', 'price_max', 'currency',
            'delivery_type', 'service_type', 'capacity', 'is_active', 'location_ids', 'specialist_ids',
        ], true);
    }

    /**
     * @return array<string, mixed>
     */
    protected function serviceData(Service $service): array
    {
        return [
            'id' => $service->id,
            'title' => $service->title,
            'description' => $service->description,
            'duration_minutes' => $service->duration,
            'price_type' => $service->price_type->value,
            'price' => $service->price,
            'price_min' => $service->price_min,
            'price_max' => $service->price_max,
            'currency' => $service->currency->value,
            'delivery_type' => $service->delivery_type->value,
            'service_type' => $service->service_type->value,
            'capacity' => $service->capacity,
            'is_active' => $service->is_active,
            'location_ids' => $service->locations->pluck('id')->all(),
            'specialist_ids' => $service->specialists->pluck('id')->all(),
        ];
    }
}
