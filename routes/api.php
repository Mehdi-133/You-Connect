<?php

use App\Http\Controllers\IventsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AnswersController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\QuestionsController;
use App\Http\Controllers\VoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TagController;
use App\Http\Controllers\InterestController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;





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
    Route::apiResource('badges', BadgeController::class)->except(['create', 'edit']);

    Route::apiResource('clubs', ClubController::class);
    Route::post('clubs/{club}/join', [ClubController::class, 'join']);
    Route::delete('clubs/{club}/leave', [ClubController::class, 'leave']);
    Route::post('clubs/{club}/invite', [ClubController::class, 'invite']);
    Route::delete('clubs/{club}/members', [ClubController::class, 'removeMember']);
    Route::patch('clubs/{club}/members/role', [ClubController::class, 'changeRole']);
    Route::patch('clubs/{club}/suspend', [ClubController::class, 'suspend']);
    Route::patch('clubs/{club}/restore', [ClubController::class, 'restore']);

    Route::post('users/{user}/badges/{badge}', [ProfilController::class, 'assignBadge']);
    Route::delete('users/{user}/badges/{badge}', [ProfilController::class, 'revokeBadge']);
    Route::get('users', [ProfilController::class, 'index']);
    Route::get('users/{user}', [ProfilController::class, 'show']);
    Route::put('users/{user}', [ProfilController::class, 'update']);
    Route::delete('users/{user}', [ProfilController::class, 'destroy']);
    Route::patch('users/{user}/ban', [ProfilController::class, 'banned']);
    Route::patch('users/{user}/restore', [ProfilController::class, 'restore']);
    Route::patch('users/{user}/change-role', [ProfilController::class, 'changeRole']);

    Route::apiResource('events', IventsController::class)->parameters(['events' => 'ivent']);
    Route::patch('events/{ivent}/cancel', [IventsController::class, 'cancel']);
    Route::patch('events/{ivent}/suspend', [IventsController::class, 'suspend']);
    Route::patch('events/{ivent}/restore', [IventsController::class, 'restore']);
    Route::post('events/{ivent}/join', [IventsController::class, 'join']);
    Route::delete('events/{ivent}/leave', [IventsController::class, 'leave']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/{notification}', [NotificationController::class, 'show']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::delete('notifications', [NotificationController::class, 'destroyAll']);

    Route::apiResource('tags', TagController::class)->except(['create', 'edit']);
    Route::post('likes', [LikeController::class, 'store']);
    Route::apiResource('badges', BadgeController::class)->except(['create', 'edit']);
    Route::apiResource('tags', TagController::class)->except(['create', 'edit']);


    Route::apiResource('interests', InterestController::class)->except(['create', 'edit']);
    Route::post('users/{user}/interests/{interest}', [ProfilController::class, 'addInterest']);
    Route::delete('users/{user}/interests/{interest}', [ProfilController::class, 'removeInterest']);

    Route::apiResource('chats', ChatController::class)->only(['index', 'store', 'show']);


    Route::get('chats/{chat}/messages', [MessageController::class, 'index']);
    Route::post('chats/{chat}/messages', [MessageController::class, 'store']);
    Route::delete('messages/{message}', [MessageController::class, 'destroy']);
    Route::put('messages/{message}', [MessageController::class, 'update']);

});
