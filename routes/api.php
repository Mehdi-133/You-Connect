<?php

use App\Http\Controllers\AnswersController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\QuestionsController;
use App\Http\Controllers\VoteController;
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

    Route::apiResource('blogs', BlogController::class)->except(['index']);
    Route::get('blogs', [BlogController::class, 'index']);
    Route::patch('blogs/{blog}/approve', [BlogController::class, 'approve']);
    Route::patch('blogs/{blog}/reject', [BlogController::class, 'reject']);
    Route::patch('blogs/{blog}/suspend', [BlogController::class, 'suspend']);
    Route::patch('blogs/{blog}/restore', [BlogController::class, 'restore']);
    Route::patch('blogs/{blog}/highlight', [BlogController::class, 'highlight']);


    Route::apiResource('comments', CommentController::class)->except(['index']);
    Route::patch('comments/{comment}/suspend', [CommentController::class, 'suspend']);
    Route::patch('comments/{comment}/restore', [CommentController::class, 'restore']);


    Route::post('votes', [VoteController::class, 'store']);
    Route::delete('votes/{vote}', [VoteController::class, 'destroy']);


    Route::post('likes', [LikeController::class, 'store']);



    Route::get('users', [ProfilController::class, 'index']);
    Route::get('users/{user}', [ProfilController::class, 'show']);
    Route::put('users/{user}', [ProfilController::class, 'update']);
    Route::delete('users/{user}', [ProfilController::class, 'destroy']);
    Route::patch('users/{user}/ban', [ProfilController::class, 'banned']);
    Route::patch('users/{user}/restore', [ProfilController::class, 'restore']);
    Route::patch('users/{user}/change-role', [ProfilController::class, 'changeRole']);

});
