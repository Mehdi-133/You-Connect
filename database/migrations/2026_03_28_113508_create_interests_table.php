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
        Schema::create('interests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', [
                'web_development',
                'mobile_development',
                'data_science',
                'machine_learning',
                'artificial_intelligence',
                'cyber_security',
                'cloud_computing',
                'devops',
                'blockchain',
                'game_development',
                'embedded',
                'networking',
                'database_administration',
                'systems_programming',
                'open_source',
                'ui_ux_design',
                'software_architecture',
                'testing',
                'other',
            ])->default('other');
            $table->string('icon')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interests');
    }
};
