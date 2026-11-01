<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5174/'));
});

Route::get('/login', function () {
    return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5174/login'));
})->name('login');
