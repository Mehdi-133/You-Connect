<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('actor_id')
                ->nullable()
                ->after('you_coder_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->json('data')->nullable()->after('content');
        });

        DB::statement("
            ALTER TABLE notifications
            MODIFY type ENUM('answer', 'blog', 'message', 'badge', 'mention', 'comment') NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE notifications
            MODIFY type ENUM('answer', 'blog', 'message', 'badge', 'mention') NOT NULL
        ");

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('actor_id');
            $table->dropColumn('data');
        });
    }
};
