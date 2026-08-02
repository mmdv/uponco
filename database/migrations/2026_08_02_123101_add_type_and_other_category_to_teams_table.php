<?php

use App\Enums\TeamType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table): void {
            $table->string('type')->nullable()->after('is_personal');
            $table->string('business_category_other', 100)->nullable()->after('business_category');
        });

        /**
         * Teams that predate the choice are organisations, so the onboarding
         * gate does not reopen for anyone who is already set up.
         */
        DB::table('teams')->update(['type' => TeamType::Organisation->value]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table): void {
            $table->dropColumn(['type', 'business_category_other']);
        });
    }
};
