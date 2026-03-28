<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('badge_user', function (Blueprint $table) {
            $table->foreignId('you_coder_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('badge_id')->constrained('badges')->cascadeOnDelete();
            $table->timestamp('awarded_at')->useCurrent();
            $table->primary(['you_coder_id', 'badge_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('badge_user');
    }
};
