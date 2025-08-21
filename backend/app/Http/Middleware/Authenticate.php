<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Log;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        Log::info('Incoming request: '.$request->method().' '.$request->fullUrl());

        // For APIs, return 401 instead of redirect
        return $request->expectsJson() ? null : abort(401, 'Unauthorized');
    }
}
