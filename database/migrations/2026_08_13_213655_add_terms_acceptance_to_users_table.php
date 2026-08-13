<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Record which version of the terms each user agreed to, and when.
     *
     * The version is stored rather than a plain boolean so that publishing new
     * terms only means bumping `legal.terms_version` — everyone whose stored
     * version no longer matches is asked to agree again, and the old value
     * stays on the row as the record of what they had previously accepted.
     *
     * Existing users are left null on purpose: they registered before there was
     * anything to agree to, so they are prompted on their next visit.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('terms_version', 32)->nullable()->after('password');
            $table->timestamp('terms_accepted_at')->nullable()->after('terms_version');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['terms_version', 'terms_accepted_at']);
        });
    }
};
