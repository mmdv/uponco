<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Addresses were previously free text, so nothing guaranteed they resolved
     * to a real place. These columns hold what Google Places returns when a
     * business picks their address from autocomplete: the canonical formatted
     * address, the coordinates, and the stable place id. Directions are built
     * from these rather than from the typed street/city fields.
     */
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->string('place_id')->nullable()->after('name');
            $table->string('formatted_address')->nullable()->after('place_id');
            $table->decimal('latitude', 10, 7)->nullable()->after('formatted_address');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn(['place_id', 'formatted_address', 'latitude', 'longitude']);
        });
    }
};
