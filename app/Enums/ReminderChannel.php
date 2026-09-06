<?php

namespace App\Enums;

/**
 * The delivery channel a scheduled appointment reminder is sent through.
 *
 * Only {@see self::Email} is wired up today; the phone-based channels are
 * declared ahead of time so a reminder row can already record the intended
 * channel and the sender registry can grow into them without a migration.
 */
enum ReminderChannel: string
{
    case Email = 'email';
    case Sms = 'sms';
    case WhatsApp = 'whatsapp';
}
