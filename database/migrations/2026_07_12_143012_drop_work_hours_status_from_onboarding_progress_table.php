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
     * The weekly work-hours onboarding step has been retired, so its status
     * column is no longer needed.
     */
    public function up(): void
    {
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->dropColumn('work_hours_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('onboarding_progress', function (Blueprint $table) {
            $table->string('work_hours_status')->default(OnboardingStepStatus::Pending->value);
        });
    }
};
