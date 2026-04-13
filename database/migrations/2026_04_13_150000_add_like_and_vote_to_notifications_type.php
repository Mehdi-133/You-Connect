<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE notifications
            MODIFY type ENUM('answer', 'blog', 'message', 'badge', 'mention', 'comment', 'like', 'vote') NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE notifications
            MODIFY type ENUM('answer', 'blog', 'message', 'badge', 'mention', 'comment') NOT NULL
        ");
    }
};
