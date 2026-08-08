<?php

use App\Http\Middleware\RememberPasskeyLogin;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Symfony\Component\HttpFoundation\Response;

function passkeyRequest(string $routeName): Request
{
    $request = Request::create('/passkeys/login', 'POST');

    $route = (new Route('POST', '/passkeys/login', []))->name($routeName);

    $request->setRouteResolver(fn () => $route);

    return $request;
}

test('it forces remember on the passkey login request', function () {
    $request = passkeyRequest('passkey.login');

    (new RememberPasskeyLogin)->handle($request, function (Request $handled) {
        expect($handled->boolean('remember'))->toBeTrue();

        return new Response('ok');
    });
});

test('it leaves other routes untouched', function () {
    $request = passkeyRequest('login');

    (new RememberPasskeyLogin)->handle($request, function (Request $handled) {
        expect($handled->boolean('remember'))->toBeFalse();

        return new Response('ok');
    });
});
