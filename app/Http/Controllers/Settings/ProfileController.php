<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's public profile page.
     */
    public function edit(Request $request): Response
    {
        $profile = $request->user()->profile;

        return Inertia::render('settings/profile', [
            'profile' => [
                'name' => $profile?->name ?? $request->user()->name,
                'email' => $profile?->email,
                'phone' => $profile?->phone,
                'job_title' => $profile?->job_title,
                'description' => $profile?->description,
            ],
        ]);
    }

    /**
     * Update the user's public profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->profile()->updateOrCreate(
            [],
            $request->validated(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return back();
    }
}
