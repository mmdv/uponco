<?php

use App\Providers\AppServiceProvider;

it('server-side renders the public marketing routes', function (string $routeName) {
    expect(AppServiceProvider::shouldServerRender($routeName))->toBeTrue();
})->with(['home', 'features', 'yourData', 'pricing', 'privacy', 'terms']);

it('leaves the authenticated app and public booking client-side rendered', function (?string $routeName) {
    expect(AppServiceProvider::shouldServerRender($routeName))->toBeFalse();
})->with([
    'appointments.index',
    'dashboard',
    'company.index',
    'schedule.index',
    'public.appointments.show',
    null,
]);
