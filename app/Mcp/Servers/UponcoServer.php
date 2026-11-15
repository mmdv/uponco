<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\FindAvailableSlotsTool;
use App\Mcp\Tools\GetAccountTool;
use App\Mcp\Tools\GetAppointmentTool;
use App\Mcp\Tools\GetBusinessOverviewTool;
use App\Mcp\Tools\GetWorkingHoursTool;
use App\Mcp\Tools\ListAppointmentsTool;
use App\Mcp\Tools\SearchCustomersTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Uponco')]
#[Version('0.2.0')]
#[Instructions(<<<'MARKDOWN'
    Uponco is appointment booking software. This server acts for the connected
    user inside their current business, with the same permissions they have in
    the Uponco app.

    Call `get-account` first. It tells you who is connected, the business
    timezone and today's date there. Every date and time you send or receive is
    in that timezone. If it reports `ready: false`, tell the user what the
    `blocker` says and stop.

    Users name services, specialists and customers; the tools take ids. Get
    service, location and specialist ids from `get-business-overview` and
    customer ids from `search-customers`. Resolve "today", "tomorrow" or
    "next Friday" against the date `get-account` returns, not your own clock.

    Users who cannot see all appointments only get their own; say so instead
    of implying the business has no other bookings.
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
    ];

    protected array $resources = [
        //
    ];

    protected array $prompts = [
        //
    ];
}
