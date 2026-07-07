<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->string('name');
            $table->string('country', 2);
            $table->string('city');
            $table->string('street_address');
            $table->string('unit')->nullable();
            $table->string('postal_code');
            $table->string('phone')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('team_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
