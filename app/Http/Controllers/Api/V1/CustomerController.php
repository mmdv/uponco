<?php

namespace App\Http\Controllers\Api\V1;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\TeamPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\SaveCustomerRequest;
use App\Http\Resources\V1\CustomerResource;
use App\Models\Appointment;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * The team's customers for the mobile Customers tab (CUST-1..4). Any team
 * member may use it, as on the web. Uses the web's `SaveCustomerRequest`.
 */
class CustomerController extends Controller
{
    use InteractsWithAppointmentBooking;

    /** Same page size as the web customers page. */
    protected const PER_PAGE = 50;

    /** How much appointment history the detail screen shows. */
    protected const HISTORY_LIMIT = 30;

    /**
     * Customers by name, optionally filtered by a search over name, email and
     * phone (same matching as the web).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $search = trim((string) $request->string('search'));

        return CustomerResource::collection(
            $request->user()->currentTeam->customers()
                ->when($search !== '', function (Builder $query) use ($search): void {
                    $query->where(function (Builder $query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
                })
                ->orderBy('name')
                ->orderBy('id')
                ->paginate(self::PER_PAGE)
                ->withQueryString(),
        );
    }

    /**
     * One customer plus their appointment history, newest first. Members
     * without view-all-appointments only see their own appointments with the
     * customer, matching the calendar.
     */
    public function show(Request $request, int $customer): JsonResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;
        $model = $this->findOnCurrentTeam($request, $customer);
        $timezone = $team->timezone ?: config('app.timezone');
        $seesAll = $user->hasTeamPermission($team, TeamPermission::ViewAllAppointments);

        $appointments = $team->appointments()
            ->where('customer_id', $model->id)
            ->when(! $seesAll, fn ($query) => $query->where('specialist_id', $user->id))
            ->with(['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'])
            ->orderByDesc('start_at')
            ->limit(self::HISTORY_LIMIT)
            ->get()
            ->map(fn (Appointment $appointment): array => $this->toAppointmentArray($appointment, $timezone))
            ->all();

        return response()->json([
            'data' => [
                ...(new CustomerResource($model))->resolve($request),
                'appointments' => $appointments,
            ],
        ]);
    }

    public function store(SaveCustomerRequest $request): JsonResponse
    {
        $customer = $request->user()->currentTeam->customers()->create($request->customerData());

        return (new CustomerResource($customer))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(SaveCustomerRequest $request, int $customer): CustomerResource
    {
        $model = $this->findOnCurrentTeam($request, $customer);

        $model->update($request->customerData());

        return new CustomerResource($model);
    }

    /**
     * Soft-deletes the customer, as the web does: their appointments keep them.
     */
    public function destroy(Request $request, int $customer): Response
    {
        $this->findOnCurrentTeam($request, $customer)->delete();

        return response()->noContent();
    }

    /**
     * Look the customer up within the current team only, so another team's
     * customer is a 404 (its existence is not revealed).
     */
    protected function findOnCurrentTeam(Request $request, int $customer): Customer
    {
        return $request->user()->currentTeam->customers()->findOrFail($customer);
    }
}
