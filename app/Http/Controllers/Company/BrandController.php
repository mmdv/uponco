<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display the team's brand settings.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('company/brand/index', [
            'widget' => [
                'scriptUrl' => route('public.widget.script', ['company' => $team->slug]),
                'bookingUrl' => route('public.appointments.show', ['company' => $team->slug]),
            ],
        ]);
    }
}
