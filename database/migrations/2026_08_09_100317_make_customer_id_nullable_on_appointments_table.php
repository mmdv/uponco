<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * A dashboard appointment may carry only a note, with no customer attached,
     * so the customer relation becomes optional.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreignId('customer_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreignId('customer_id')->nullable(false)->change();
        });
    }
};
