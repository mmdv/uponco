<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LegalConsentController extends Controller
{
    /**
     * Record the signed-in user's agreement to the terms currently in force.
     *
     * Used by the dialog that blocks the app for anyone who registered before
     * the terms existed, or who agreed to a version that has since been
     * replaced. Redirecting back re-renders the page they were on with the
     * `termsConsent` prop now null, which dismisses the dialog.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'terms' => ['accepted'],
        ]);

        $request->user()->acceptCurrentTerms();

        return back();
    }
}
