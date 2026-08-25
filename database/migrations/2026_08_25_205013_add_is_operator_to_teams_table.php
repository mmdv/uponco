<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Deliberately left `false` for every existing row: the operator team is
     * promoted explicitly (see OperatorTeamSeeder) so that a team which merely
     * happens to be named "Uponco" is never granted the backoffice.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->boolean('is_operator')->default(false)->after('is_personal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('is_operator');
        });
    }
};
