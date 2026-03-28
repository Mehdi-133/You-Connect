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
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('you_coder_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('answer_id')->constrained('answers')->cascadeOnDelete();
            $table->enum('type', ['upVote', 'downVote']);
            $table->timestamps();
            $table->unique(['you_coder_id', 'answer_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
