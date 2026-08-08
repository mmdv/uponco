<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display the signed-in user's notifications, newest first.
     *
     * No role check is needed here. Notifications are fanned out at send time —
     * a member only ever has rows for their own appointments, an admin has rows
     * for the whole team — so reading your own rows *is* the visibility rule.
     */
    public function index(Request $request): Response
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->paginate(50)
            ->withQueryString()
            ->through(fn (DatabaseNotification $notification): array => $this->toNotificationArray($notification));

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark every unread notification of the signed-in user as read.
     *
     * Called when the notification drawer closes. It touches only this user's
     * rows, so a colleague's copy of the same event stays unread.
     */
    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }

    /**
     * Shape a stored notification for the frontend.
     *
     * @return array<string, mixed>
     */
    protected function toNotificationArray(DatabaseNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'read' => $notification->read(),
            'created_at' => $notification->created_at?->toIso8601String(),
            ...$notification->data,
        ];
    }
}
