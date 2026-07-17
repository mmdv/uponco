<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Services previously reached their team only through their category, which
     * forced every service to have one. Giving services their own team_id lets
     * the category become an optional grouping label.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('team_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        // Backfilled in SQL rather than through the models so services pointing
        // at a soft-deleted category are covered too. Written as a correlated
        // subquery so it runs on both MySQL and the SQLite used by the tests.
        DB::statement('
            UPDATE services
            SET team_id = (
                SELECT team_id FROM service_categories
                WHERE service_categories.id = services.service_category_id
            )
        ');

        // Every service had a non-null category behind a foreign key, so the
        // backfill covers all of them and this cannot fail. If it somehow does,
        // failing here is preferable to silently dropping the offending rows.
        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('team_id')->nullable(false)->change();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['service_category_id']);
            $table->foreignId('service_category_id')->nullable()->change();
            $table->foreign('service_category_id')->references('id')->on('service_categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Lossy: a category is mandatory again afterwards, so services that were
     * left uncategorized have nowhere to go and are dropped.
     */
    public function down(): void
    {
        DB::table('services')->whereNull('service_category_id')->delete();

        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['service_category_id']);
            $table->foreignId('service_category_id')->nullable(false)->change();
            $table->foreign('service_category_id')->references('id')->on('service_categories')->cascadeOnDelete();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropConstrainedForeignId('team_id');
        });
    }
};
