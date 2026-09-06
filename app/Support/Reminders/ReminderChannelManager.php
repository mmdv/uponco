<?php

namespace App\Support\Reminders;

use App\Enums\ReminderChannel;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;

/**
 * Resolves the {@see ReminderSender} for a reminder channel.
 *
 * The registry is the single seam future channels plug into: map a
 * {@see ReminderChannel} to its sender binding here and the sending job reaches
 * it unchanged. Only {@see ReminderChannel::Email} is wired up today.
 */
class ReminderChannelManager
{
    /**
     * The sender binding for each supported channel.
     *
     * @var array<string, class-string<ReminderSender>>
     */
    protected array $senders = [
        ReminderChannel::Email->value => EmailReminderSender::class,
    ];

    public function __construct(protected Container $container) {}

    /**
     * Whether a sender is registered for the channel.
     */
    public function supports(ReminderChannel $channel): bool
    {
        return isset($this->senders[$channel->value]);
    }

    /**
     * Get the sender for the channel.
     *
     * @throws InvalidArgumentException when the channel has no registered sender.
     */
    public function for(ReminderChannel $channel): ReminderSender
    {
        if (! $this->supports($channel)) {
            throw new InvalidArgumentException("No reminder sender registered for channel [{$channel->value}].");
        }

        return $this->container->make($this->senders[$channel->value]);
    }
}
