<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\BookAppointmentTool;
use App\Mcp\Tools\CancelAppointmentTool;
use App\Mcp\Tools\FindAvailableSlotsTool;
use App\Mcp\Tools\GetAccountTool;
use App\Mcp\Tools\GetAppointmentTool;
use App\Mcp\Tools\GetBusinessOverviewTool;
use App\Mcp\Tools\GetWorkingHoursTool;
use App\Mcp\Tools\ListAppointmentsTool;
use App\Mcp\Tools\MarkNoShowTool;
use App\Mcp\Tools\RescheduleAppointmentTool;
use App\Mcp\Tools\SearchCustomersTool;
use App\Mcp\Tools\SetDayOffTool;
use App\Mcp\Tools\SetWorkingHoursTool;
use App\Mcp\Tools\SwitchBusinessTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Uponco')]
#[Version('0.4.0')]
#[Instructions(<<<'MARKDOWN'
    Uponco is appointment booking software. This server acts for the connected
    user inside their current business, with the same permissions they have in
    the Uponco app.

    Call `get-account` first. It tells you who is connected, the business
    timezone and today's date there. Every date and time you send or receive is
    in that timezone. If it reports `ready: false`, tell the user what the
    `blocker` says and stop. When the user belongs to several businesses
    (`businesses`), make sure you are in the one they mean; `switch-business`
    changes it.

    Users name services, specialists and customers; the tools take ids. Get
    service, location and specialist ids from `get-business-overview` and
    customer ids from `search-customers`. Resolve "today", "tomorrow" or
    "next Friday" against the date `get-account` returns, not your own clock.

    Users who cannot see all appointments only get their own; say so instead
    of implying the business has no other bookings.

    Tools that change things (booking, rescheduling, cancelling, working hours,
    days off) act at once and some email the customer. Before calling one, say
    exactly what will change — customer, specialist, day and time — and wait for
    the user to confirm. Book and reschedule only into times `find-available-slots`
    returned. Changing hours or adding a day off never cancels bookings; report
    any `appointments_outside_hours` and ask what to do with them.
    MARKDOWN)]
class UponcoServer extends Server
{
    protected array $tools = [
        GetAccountTool::class,
        GetBusinessOverviewTool::class,
        ListAppointmentsTool::class,
        GetAppointmentTool::class,
        FindAvailableSlotsTool::class,
        GetWorkingHoursTool::class,
        SearchCustomersTool::class,
        BookAppointmentTool::class,
        RescheduleAppointmentTool::class,
        CancelAppointmentTool::class,
        MarkNoShowTool::class,
        SetWorkingHoursTool::class,
        SetDayOffTool::class,
        SwitchBusinessTool::class,
    ];

    protected array $resources = [
        //
    ];

    protected array $prompts = [
        //
    ];
}
