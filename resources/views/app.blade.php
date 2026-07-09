<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {{-- SEO: server-rendered so crawlers and social scrapers (which don't run JS) can read them --}}
        @php
            $seoTitle = config('app.name').' — Appointment Booking Software for Your Business';
            $seoDescription = config('app.name').' is easy appointment booking software for your business. Manage every location and service, online or onsite, with automatic reminders.';
            $ogDescription = 'Easy appointment booking for your business — online or onsite, with reminders. Your first 100 appointments are free.';
            $seoImage = rtrim(config('app.url'), '/').'/og-image.png';
            $canonical = url()->current();
            $structuredData = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'Organization',
                        '@id' => rtrim(config('app.url'), '/').'/#organization',
                        'name' => config('app.name'),
                        'url' => rtrim(config('app.url'), '/'),
                        'logo' => $seoImage,
                    ],
                    [
                        '@type' => 'WebSite',
                        '@id' => rtrim(config('app.url'), '/').'/#website',
                        'name' => config('app.name'),
                        'url' => rtrim(config('app.url'), '/'),
                        'publisher' => ['@id' => rtrim(config('app.url'), '/').'/#organization'],
                    ],
                    [
                        '@type' => 'SoftwareApplication',
                        'name' => config('app.name'),
                        'applicationCategory' => 'BusinessApplication',
                        'operatingSystem' => 'Web',
                        'url' => rtrim(config('app.url'), '/'),
                        'description' => $seoDescription,
                        'offers' => [
                            '@type' => 'Offer',
                            'price' => '0',
                            'priceCurrency' => 'EUR',
                            'description' => 'First 100 appointments free — no card required.',
                        ],
                    ],
                ],
            ];
        @endphp

        <meta name="description" content="{{ $seoDescription }}">
        <meta name="keywords" content="appointment booking, online scheduling, booking software, appointment scheduler, salon booking, multi-location scheduling, group bookings, appointment reminders, {{ config('app.name') }}">
        <meta name="robots" content="index, follow, max-image-preview:large">
        <meta name="application-name" content="{{ config('app.name') }}">
        <meta name="author" content="{{ config('app.name') }}">
        <meta name="theme-color" content="#ffffff">
        <link rel="canonical" href="{{ $canonical }}">

        {{-- Open Graph --}}
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name') }}">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $ogDescription }}">
        <meta property="og:url" content="{{ $canonical }}">
        <meta property="og:image" content="{{ $seoImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="{{ config('app.name') }} — appointment booking for your business">
        <meta property="og:locale" content="en_US">

        {{-- Twitter --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $ogDescription }}">
        <meta name="twitter:image" content="{{ $seoImage }}">
        <meta name="twitter:image:alt" content="{{ config('app.name') }} — appointment booking for your business">

        <script type="application/ld+json">
            {!! json_encode($structuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
        </script>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">

        <link rel="manifest" href="/app.webmanifest">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700&display=swap" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
