<?php

use App\Enums\OnboardingStepStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The step status columns as they existed when this table was first created.
     *
     * Hardcoded (rather than derived from the OnboardingStep enum) so the
     * migration stays accurate even as steps are added or removed later.
     *
     * @var list<string>
     */
    private array $stepColumns = [
        'locations_status',
        'services_status',
        'profile_status',
        'work_hours_status',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('onboarding_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            foreach ($this->stepColumns as $column) {
                $table->string($column)->default(OnboardingStepStatus::Pending->value);
            }

            // Hardcoded for the same reason as the step columns above: the
            // first step at the time this table was created.
            $table->string('current_step')->default('locations');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['team_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onboarding_progress');
    }
};
