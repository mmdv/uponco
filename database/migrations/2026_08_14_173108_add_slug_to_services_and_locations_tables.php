<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('title');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        $this->backfill('services', 'title');
        $this->backfill('locations', 'name');

        Schema::table('services', function (Blueprint $table) {
            $table->unique(['team_id', 'slug']);
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->unique(['team_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropUnique(['team_id', 'slug']);
            $table->dropColumn('slug');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropUnique(['team_id', 'slug']);
            $table->dropColumn('slug');
        });
    }

    /**
     * Give every existing row a slug that is unique within its team.
     *
     * Soft-deleted rows are included: they keep occupying the unique index, so
     * skipping them would let a later live row collide with one of them.
     */
    protected function backfill(string $table, string $sourceColumn): void
    {
        $used = [];

        DB::table($table)
            ->select(['id', 'team_id', $sourceColumn])
            ->orderBy('id')
            ->each(function (object $row) use ($table, $sourceColumn, &$used): void {
                $teamId = $row->team_id;

                if ($teamId === null) {
                    return;
                }

                $base = Str::slug((string) $row->{$sourceColumn}) ?: 'item';
                $slug = $base;
                $suffix = 1;

                while (isset($used[$teamId][$slug])) {
                    $slug = $base.'-'.$suffix++;
                }

                $used[$teamId][$slug] = true;

                DB::table($table)->where('id', $row->id)->update(['slug' => $slug]);
            });
    }
};
