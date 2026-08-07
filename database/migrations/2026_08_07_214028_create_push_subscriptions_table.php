<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * One row per browser/device that has granted push permission. The endpoint
     * is the push service's unique URL for that device, so it is the natural
     * unique key: re-subscribing the same device updates the row instead of
     * creating a duplicate.
     */
    public function up(): void
    {
        Schema::create(config('webpush.table_name'), function (Blueprint $table) {
            $table->id();
            $table->morphs('subscribable', 'push_subscriptions_subscribable_morph_idx');
            $table->string('endpoint', 500)->unique();
            $table->string('public_key')->nullable();
            $table->string('auth_token')->nullable();
            $table->string('content_encoding')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(config('webpush.table_name'));
    }
};
