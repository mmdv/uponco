<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the operator flag: the platform backoffice has been removed, so no
     * team is "the operator" any more and the public booking guard no longer
     * consults this column.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('is_operator');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->boolean('is_operator')->default(false)->after('is_personal');
        });
    }
};
