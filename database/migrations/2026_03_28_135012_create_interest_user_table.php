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
        Schema::create('interest_user', function (Blueprint $table) {
            $table->foreignId('you_coder_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('interest_id')->constrained('interests')->cascadeOnDelete();
            $table->timestamp('selected_at')->useCurrent();
            $table->primary(['you_coder_id', 'interest_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interest_user');
    }
};
