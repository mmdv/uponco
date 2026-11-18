<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Support\Company\CompanyOverview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Display the company overview page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('company/index', CompanyOverview::for($request->user()));
    }
}
