<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ivents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('you_coder_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->enum('status', ['upcoming', 'ongoing', 'finished', 'cancelled', 'suspended'])->default('upcoming');
            $table->timestamps();
        });

        Schema::create('ivent_user', function (Blueprint $table) {
            $table->foreignId('you_coder_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ivent_id')->constrained('ivents')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            $table->primary(['you_coder_id', 'ivent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ivent_user');
        Schema::dropIfExists('ivents');
    }
};
