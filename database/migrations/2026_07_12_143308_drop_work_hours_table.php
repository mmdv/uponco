<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Weekly work hours have been replaced by the date-based `schedule_slots`
     * table, so this table is no longer used.
     */
    public function up(): void
    {
        Schema::dropIfExists('work_hours');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('work_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 0=Mon, 1=Tue, ... 6=Sun
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();

            $table->index(['user_id', 'team_id', 'day_of_week']);
        });
    }
};
