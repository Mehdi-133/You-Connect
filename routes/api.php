<?php

use App\Http\Controllers\AnswersController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum', 'check.status')->group(function () {

    Route::delete('/logout', [AuthController::class, 'logout']);
    Route::apiResource('questions', QuestionsController::class);
    Route::patch('questions/{question}/suspend', [QuestionsController::class, 'suspend']);
    Route::patch('questions/{question}/restore', [QuestionsController::class, 'restore']);

    Route::get('questions/{question}/answers', [AnswersController::class, 'index']);
    Route::apiResource('answers', AnswersController::class)->except(['index']);
    Route::patch('answers/{answer}/suspend', [AnswersController::class, 'suspend']);
    Route::patch('answers/{answer}/highlight', [AnswersController::class, 'highlight']);
    Route::patch('answers/{answer}/accept', [AnswersController::class, 'accept']);
});
