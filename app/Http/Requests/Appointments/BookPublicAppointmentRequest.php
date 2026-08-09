<?php

namespace App\Http\Requests\Appointments;

use App\Models\Team;

/**
 * Validates a booking submitted from the public, unauthenticated booking page.
 *
 * The team is resolved from the {company} route binding rather than the
 * authenticated user's current team, but every availability and ownership
 * check is otherwise identical to the dashboard flow.
 */
class BookPublicAppointmentRequest extends SaveAppointmentRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the team the appointment belongs to.
     */
    protected function team(): Team
    {
        return $this->route('company');
    }

    /**
     * A public booking must name the customer and carry a way to reach them, so
     * the name is required and at least one of email or phone is required.
     *
     * @return array<string, array<int, string>>
     */
    protected function customerRules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'required_without:customer_phone', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'required_without:customer_email', 'string', 'max:255'],
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_email.required_without' => __('Enter an email or a phone number for the customer.'),
            'customer_phone.required_without' => __('Enter a phone number or an email for the customer.'),
        ];
    }
}
