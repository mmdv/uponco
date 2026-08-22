<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The languages a team offers on its public booking page. When either is
     * null the team falls back to the platform-wide locale configuration, so an
     * untouched team behaves exactly as it did before.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('default_locale', 5)->nullable()->after('brand_primary_color');
            $table->json('available_locales')->nullable()->after('default_locale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn(['default_locale', 'available_locales']);
        });
    }
};
