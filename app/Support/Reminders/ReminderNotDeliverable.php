<?php

namespace App\Support\Reminders;

use RuntimeException;

/**
 * Thrown by a {@see ReminderSender} when the customer cannot be reached on its
 * channel (e.g. an email reminder for a customer who left no email address).
 *
 * This is a benign, expected outcome — the job records the reminder as skipped
 * rather than failed and does not retry.
 */
class ReminderNotDeliverable extends RuntimeException {}
