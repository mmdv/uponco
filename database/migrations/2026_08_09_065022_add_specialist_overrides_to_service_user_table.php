<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Per-specialist overrides for a service: when a column is null the
     * specialist simply inherits the service's own duration/price.
     */
    public function up(): void
    {
        Schema::table('service_user', function (Blueprint $table) {
            $table->unsignedInteger('duration')->nullable()->after('user_id');
            $table->decimal('price', 10, 2)->nullable()->after('duration');
            $table->decimal('price_min', 10, 2)->nullable()->after('price');
            $table->decimal('price_max', 10, 2)->nullable()->after('price_min');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_user', function (Blueprint $table) {
            $table->dropColumn(['duration', 'price', 'price_min', 'price_max']);
        });
    }
};
