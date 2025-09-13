<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;


Route::get('/run-migrate', function () {
    Artisan::call('migrate', ['--force' => true]);
    return "Migrations run!";
});



