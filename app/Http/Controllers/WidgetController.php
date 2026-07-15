<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Response;

class WidgetController extends Controller
{
    /**
     * Serve the embeddable booking widget script for a company.
     *
     * The script is namespaced per company so customers only ever copy a
     * single `<script>` tag with no additional configuration.
     */
    public function script(Team $company): Response
    {
        $config = [
            'url' => route('public.appointments.show', ['company' => $company->slug]),
            'label' => __('Book online'),
            'company' => $company->name,
        ];

        $body = (string) file_get_contents(resource_path('widget/booking-widget.js'));

        $script = 'window.__UPONCO_WIDGET__='.json_encode($config, JSON_UNESCAPED_SLASHES).';'.$body;

        return response($script, 200, [
            'Content-Type' => 'application/javascript; charset=UTF-8',
            'Cache-Control' => 'public, max-age=300',
        ]);
    }
}
