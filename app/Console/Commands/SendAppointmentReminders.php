<?php

namespace App\Console\Commands;

use App\Jobs\SendAppointmentReminder;
use App\Models\AppointmentReminder;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Dispatches every reminder whose send time has arrived.
 *
 * Runs every minute from the scheduler. It replaces per-reminder delayed
 * dispatch, which cannot be used in production: the cloud queue is Amazon SQS,
 * whose per-message delay caps at 15 minutes, so a reminder hours or days out
 * could never simply wait in the queue. Here the delay lives in the row's
 * `send_at`, this command finds the due rows via the `['status','send_at']`
 * index, and each job is dispatched with no delay.
 */
class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'appointments:send-reminders';

    /**
     * The console command description.
     */
    protected $description = 'Dispatch appointment reminders that are due to be sent';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dispatched = 0;

        AppointmentReminder::due()
            ->chunkById(200, function (Collection $reminders) use (&$dispatched): void {
                foreach ($reminders as $reminder) {
                    SendAppointmentReminder::dispatch($reminder);
                    $dispatched++;
                }
            });

        // A per-minute heartbeat: its presence in the logs proves the scheduler
        // is invoking this command, and `dispatched` shows how much it sent.
        Log::info('appointments:send-reminders ran', ['dispatched' => $dispatched]);

        $this->info("Dispatched {$dispatched} appointment reminder(s).");

        return self::SUCCESS;
    }
}
