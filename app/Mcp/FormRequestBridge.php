<?php

namespace App\Mcp;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Redirector;
use Illuminate\Routing\Route;
use Illuminate\Validation\ValidationException;

/**
 * Runs one of the app's HTTP form requests on tool arguments, so a write tool
 * applies exactly the validation (and availability checks) the web and mobile
 * forms do instead of a copy of them.
 */
class FormRequestBridge
{
    /**
     * Build the form request for the user, validate it and return it ready to
     * read (`validated()`, and its own helpers such as `appointmentData()`).
     *
     * @template TRequest of FormRequest
     *
     * @param  class-string<TRequest>  $formRequest
     * @param  array<string, mixed>  $input
     * @param  array<string, mixed>  $routeParameters  What the request reads with `$this->route(...)`.
     * @return TRequest
     *
     * @throws ValidationException
     */
    public static function validate(string $formRequest, User $user, array $input, array $routeParameters = []): FormRequest
    {
        $request = $formRequest::create('/mcp', 'POST', $input);

        $route = new Route('POST', 'mcp', fn () => null);
        $route->bind($request);

        foreach ($routeParameters as $name => $value) {
            $route->setParameter($name, $value);
        }

        $request->setRouteResolver(fn (): Route => $route);
        $request->setUserResolver(fn (): User => $user);
        $request->setContainer(app())->setRedirector(app(Redirector::class));

        $request->validateResolved();

        return $request;
    }
}
