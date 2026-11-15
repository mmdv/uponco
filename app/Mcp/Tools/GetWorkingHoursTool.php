<?php

namespace App\Mcp\Tools;

use App\Models\Team;
use App\Models\User;
use App\Support\ScheduleSlotMap;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get-working-hours')]
#[Title('Get working hours')]
#[Description('A specialist\'s working hours for each day in a date range (business timezone). A day with no hours is a day off. Everyone can read their own hours; owners and admins can read anyone\'s.')]
#[IsReadOnly]
#[IsIdempotent]
class GetWorkingHoursTool extends BusinessTool
{
    /** The longest range one call may read (same as the mobile app). */
    protected const MAX_DAYS = 62;

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->format('date')->description('First day, YYYY-MM-DD.')->required(),
            'to' => $schema->string()->format('date')->description('Last day, YYYY-MM-DD. Defaults to `from`. At most 62 days after it.'),
            'specialist_id' => $schema->integer()->description('Whose hours. Defaults to the connected user.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $data = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'specialist_id' => ['nullable', 'integer'],
        ]);

        $from = CarbonImmutable::createFromFormat('Y-m-d', $data['from'])->startOfDay();
        $to = CarbonImmutable::createFromFormat('Y-m-d', $data['to'] ?? $data['from'])->startOfDay();

        if ($from->diffInDays($to) >= self::MAX_DAYS) {
            return Response::error(__('Choose a shorter date range.'));
        }

        $member = $this->schedulableMember($user, $team, (int) ($data['specialist_id'] ?? $user->id));

        if ($member === null) {
            return Response::error(__('You can only see your own working hours.'));
        }

        $map = ScheduleSlotMap::forMember($team, $member, $from->format('Y-m-d'), $to->format('Y-m-d'));
        $days = [];

        for ($day = $from; $day <= $to; $day = $day->addDay()) {
            $hours = $map[$day->format('Y-m-d')] ?? [];

            $days[] = [
                'date' => $day->format('Y-m-d'),
                'weekday' => $day->englishDayOfWeek,
                'day_off' => $hours === [],
                'hours' => $hours,
            ];
        }

        return Response::structured([
            'specialist' => ['id' => $member->id, 'name' => $member->name],
            'timezone' => $this->timezone($team),
            'days' => $days,
        ]);
    }
}
