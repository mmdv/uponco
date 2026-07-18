<?php

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Locations are now created from inside the service wizard, so the
     * standalone onboarding step (and its status column) has been retired.
     *
     * Any row parked on a step that no longer exists — 'locations', or the
     * older 'work_hours' — is moved to the first surviving step, otherwise
     * casting `current_step` back to the enum throws.
     */
    public function up(): void
    {
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->dropColumn('locations_status');
        });

        DB::table('onboarding_progress')
            ->whereNotIn('current_step', array_column(OnboardingStep::cases(), 'value'))
            ->update(['current_step' => OnboardingStep::Services->value]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->string('locations_status')
                ->default(OnboardingStepStatus::Pending->value)
                ->after('user_id');
        });
    }
};
