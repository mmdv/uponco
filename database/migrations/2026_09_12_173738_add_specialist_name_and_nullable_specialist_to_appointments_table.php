<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Snapshot the specialist's name onto each appointment and relax the
     * specialist foreign key so deleting a user preserves the appointment as
     * team history instead of cascading it away. Appointments are still purged
     * with their team via the `team_id` cascade.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->string('specialist_name')->nullable()->after('specialist_id');
        });

        // Capture the current specialist's name for existing history before the
        // link is allowed to go null. Portable across MySQL (dev) and sqlite (tests).
        DB::statement(
            'UPDATE appointments SET specialist_name = ('.
            'SELECT name FROM users WHERE users.id = appointments.specialist_id'.
            ') WHERE specialist_name IS NULL'
        );

        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropForeign(['specialist_id']);
            $table->foreignId('specialist_id')->nullable()->change();
            $table->foreign('specialist_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropForeign(['specialist_id']);
            $table->foreignId('specialist_id')->nullable(false)->change();
            $table->foreign('specialist_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropColumn('specialist_name');
        });
    }
};
