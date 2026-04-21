<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('slug');
        });

        Schema::table('ivents', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn('photo');
        });

        Schema::table('ivents', function (Blueprint $table) {
            $table->dropColumn('photo');
        });
    }
};

