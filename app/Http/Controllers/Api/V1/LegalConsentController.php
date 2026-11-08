<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use Illuminate\Http\Request;

class LegalConsentController extends Controller
{
    /**
     * Record the user's agreement to the terms currently in force, from the
     * app's blocking terms screen (same rule as the web consent dialog).
     */
    public function store(Request $request): UserResource
    {
        $request->validate([
            'terms' => ['accepted'],
        ]);

        $request->user()->acceptCurrentTerms();

        return new UserResource($request->user());
    }
}
