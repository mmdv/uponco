<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\GetAccountTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Uponco')]
#[Version('0.1.0')]
#[Instructions(<<<'MARKDOWN'
    Uponco is appointment booking software. This server acts for the connected
    user inside their current business, with the same permissions they have in
    the Uponco app.

    Call `get-account` first. It tells you who is connected, the business
    timezone and today's date there. Every date and time you send or receive is
    in that timezone. If it reports `ready: false`, tell the user what the
    `blocker` says and stop.
    MARKDOWN)]
class UponcoServer extends Server
{
    protected array $tools = [
        GetAccountTool::class,
    ];

    protected array $resources = [
        //
    ];

    protected array $prompts = [
        //
    ];
}
