<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Notifications\DatabaseNotification;

/**
 * The mobile Notifications tab (NOTIF-1): the same per-person feed as the
 * web bell and notifications page. Notifications are fanned out when sent
 * (a member only gets their own appointments' alerts), so reading your own
 * rows is the visibility rule — no extra role check, as on the web.
 */
class NotificationController extends Controller
{
    /** Same page size as the web notifications page. */
    protected const PER_PAGE = 50;

    /**
     * The user's notifications, newest first, with the unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $page = $user->notifications()
            ->latest()
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return response()->json([
            'data' => collect($page->items())
                ->map(fn (DatabaseNotification $notification): array => $this->toArray($notification))
                ->all(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'unread' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    /**
     * Just the unread count, for the tab badge.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json(['data' => ['unread' => $request->user()->unreadNotifications()->count()]]);
    }

    /**
     * Mark all of the user's notifications read (a colleague's copy of the
     * same event stays unread), as the web bell does.
     */
    public function markAllRead(Request $request): Response
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->noContent();
    }

    /**
     * Same shape as the web feed: id, read, created_at plus the stored payload
     * (alert, appointment_id, service_title, customer_name, start_at, …).
     *
     * @return array<string, mixed>
     */
    protected function toArray(DatabaseNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'read' => $notification->read(),
            'created_at' => $notification->created_at?->toIso8601String(),
            ...$notification->data,
        ];
    }
}
