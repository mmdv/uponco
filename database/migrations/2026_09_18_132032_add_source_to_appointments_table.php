<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Record where each appointment came from so the team can tell customer
     * self-service bookings apart from ones a specialist entered by hand.
     *
     * Existing rows can't be attributed retroactively, so they default to
     * `staff`; the split is accurate from this point forward.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->string('source')->default('staff')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropColumn('source');
        });
    }
};
