<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Display the monthly scheduling page.
     *
     * Front-end shell only for now: the grid, month carousel and edit drawer are
     * driven entirely client-side with mocked members. No schedule data is
     * loaded or persisted yet.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('schedule/index');
    }
}
