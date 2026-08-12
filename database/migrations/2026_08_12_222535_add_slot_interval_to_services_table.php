<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The interval (minutes) between candidate start times for the service.
     * When null the generator falls back to its smart default of
     * min(duration, 30), preserving the previous behaviour.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedSmallInteger('slot_interval')->nullable()->after('technical_break');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('slot_interval');
        });
    }
};
