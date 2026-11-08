<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Return the authenticated user with their team context.
     */
    public function __invoke(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
