<?php

namespace App\Http\Controllers;

use App\Http\Requests\Customers\SaveCustomerRequest;
use App\Models\Customer;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the team's customers.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $search = trim((string) $request->string('search'));

        $customers = $team->customers()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString()
            ->through(fn (Customer $customer): array => $this->toCustomerArray($customer));

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(SaveCustomerRequest $request): RedirectResponse
    {
        $request->user()->currentTeam->customers()->create($request->customerData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer created.')]);

        return back();
    }

    /**
     * Update the specified customer.
     */
    public function update(SaveCustomerRequest $request, string $current_team, Customer $customer): RedirectResponse
    {
        $this->authorizeCustomer($request, $customer);

        $customer->update($request->customerData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer updated.')]);

        return back();
    }

    /**
     * Delete the specified customer.
     */
    public function destroy(Request $request, string $current_team, Customer $customer): RedirectResponse
    {
        $this->authorizeCustomer($request, $customer);

        $customer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer deleted.')]);

        return back();
    }

    /**
     * Ensure the customer belongs to the user's current team.
     */
    protected function authorizeCustomer(Request $request, Customer $customer): void
    {
        /** @var Team $team */
        $team = $request->user()->currentTeam;

        abort_unless($customer->team_id === $team->id, 403);
    }

    /**
     * Transform a customer into its array representation.
     *
     * @return array<string, mixed>
     */
    protected function toCustomerArray(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
        ];
    }
}
