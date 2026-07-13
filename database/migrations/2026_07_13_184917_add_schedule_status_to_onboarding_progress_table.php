<?php

use App\Enums\OnboardingStepStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The schedule (work hours) step closes out onboarding, so its status is
     * tracked alongside the other steps.
     */
    public function up(): void
    {
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->string('schedule_status')
                ->default(OnboardingStepStatus::Pending->value)
                ->after('profile_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->dropColumn('schedule_status');
        });
    }
};
