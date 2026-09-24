<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The design the team's public booking page renders with, from
     * `App\Enums\BookingPageDesign`. When null the page falls back to the
     * default (classic) design, so an untouched team looks exactly as before.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('booking_page_design', 20)->nullable()->after('brand_primary_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('booking_page_design');
        });
    }
};
