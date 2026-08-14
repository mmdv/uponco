<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The team's chosen brand primary colour as a `#rrggbb` string. When null
     * the brand palette falls back to the platform blue, so an untouched team
     * looks exactly as it did before.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('brand_primary_color', 7)->nullable()->after('logo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('brand_primary_color');
        });
    }
};
