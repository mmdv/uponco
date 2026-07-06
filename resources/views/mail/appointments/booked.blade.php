@php
    $font = "'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $title }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{{ $intro }}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">

                    {{-- Uponco header --}}
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="vertical-align:middle;">
                                        <img src="{{ asset('icons/icon-512.png') }}" width="28" height="28" alt="{{ config('app.name') }}" style="display:block;border-radius:7px;">
                                    </td>
                                    <td style="vertical-align:middle;padding-left:8px;font-family:{{ $font }};font-size:17px;font-weight:700;color:#18181b;">
                                        Uponco
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Card --}}
                    <tr>
                        <td style="background-color:#ffffff;border:1px solid #e4e4e7;border-radius:16px;padding:36px 32px;">
                            @if ($teamLogoUrl)
                                <img src="{{ $teamLogoUrl }}" width="48" height="48" alt="{{ $teamName }}" style="display:block;border-radius:12px;margin-bottom:16px;">
                            @endif

                            <p style="margin:0;font-family:{{ $font }};font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#0063ff;">
                                {{ $teamName }}
                            </p>

                            <h1 style="margin:8px 0 0;font-family:{{ $font }};font-size:22px;font-weight:600;color:#18181b;">
                                {{ $title }}
                            </h1>

                            <p style="margin:20px 0 0;font-family:{{ $font }};font-size:14px;line-height:1.6;color:#3f3f46;">
                                {{ __('Dear :name,', ['name' => $customerName]) }}
                            </p>

                            <p style="margin:12px 0 0;font-family:{{ $font }};font-size:14px;line-height:1.6;color:#3f3f46;">
                                {{ $intro }}
                            </p>

                            {{-- Appointment details --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:#fafafa;border:1px solid #ececee;border-radius:12px;">
                                <tr>
                                    <td style="padding:8px 20px 20px;">
                                        @foreach ([
                                            __('Service') => $serviceTitle,
                                            __('Specialist') => $specialistName,
                                            __('Date') => $dateLine,
                                            __('Time') => $timeLine,
                                        ] as $label => $value)
                                            <p style="margin:16px 0 0;font-family:{{ $font }};font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:#a1a1aa;">
                                                {{ $label }}
                                            </p>
                                            <p style="margin:2px 0 0;font-family:{{ $font }};font-size:15px;font-weight:600;color:#18181b;">
                                                {{ $value }}
                                            </p>
                                        @endforeach

                                        <p style="margin:16px 0 0;font-family:{{ $font }};font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:#a1a1aa;">
                                            {{ __('Location') }}
                                        </p>
                                        <p style="margin:2px 0 0;font-family:{{ $font }};font-size:15px;font-weight:600;color:#18181b;">
                                            {{ $locationName }}
                                        </p>
                                        @if ($locationAddress)
                                            <p style="margin:2px 0 0;font-family:{{ $font }};font-size:13px;line-height:1.5;color:#71717a;">
                                                {{ $locationAddress }}
                                            </p>
                                        @endif
                                        @if ($locationPhone)
                                            <p style="margin:2px 0 0;font-family:{{ $font }};font-size:13px;color:#71717a;">
                                                {{ $locationPhone }}
                                            </p>
                                        @endif

                                        @if ($notes)
                                            <p style="margin:16px 0 0;font-family:{{ $font }};font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:#a1a1aa;">
                                                {{ __('Notes') }}
                                            </p>
                                            <p style="margin:2px 0 0;font-family:{{ $font }};font-size:14px;line-height:1.5;color:#3f3f46;">
                                                {{ $notes }}
                                            </p>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            @if ($meetingUrl)
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                                    <tr>
                                        <td align="center" style="border-radius:10px;background-color:#0063ff;">
                                            <a href="{{ $meetingUrl }}" target="_blank" style="display:block;padding:14px 24px;font-family:{{ $font }};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                                                {{ __('Join online meeting') }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin:10px 0 0;font-family:{{ $font }};font-size:13px;line-height:1.5;color:#71717a;word-break:break-all;">
                                    {{ $meetingUrl }}
                                </p>
                            @endif

                            <p style="margin:24px 0 0;font-family:{{ $font }};font-size:14px;line-height:1.6;color:#3f3f46;">
                                {{ __('A calendar invitation is attached to this email so you can add the appointment to your calendar.') }}
                            </p>

                            <p style="margin:12px 0 0;font-family:{{ $font }};font-size:14px;line-height:1.6;color:#3f3f46;">
                                {{ __('If you need to reschedule or cancel, simply reply to this email and we will be glad to assist you.') }}
                            </p>

                            <p style="margin:24px 0 0;font-family:{{ $font }};font-size:14px;line-height:1.6;color:#3f3f46;">
                                {{ __('Kind regards,') }}<br>
                                <span style="font-weight:600;color:#18181b;">{{ __('The :team team', ['team' => $teamName]) }}</span>
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td align="center" style="padding-top:24px;">
                            <p style="margin:0;font-family:{{ $font }};font-size:12px;line-height:1.7;color:#a1a1aa;">
                                {{ __('This email was sent by Uponco on behalf of :team.', ['team' => $teamName]) }}<br>
                                © {{ now()->year }} Uponco · {{ __('Your digital bridge to your customers') }}
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
