<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default & Fallback Locale
    |--------------------------------------------------------------------------
    |
    | The locale used when a visitor's preference can't be determined, and the
    | locale to fall back to when a translation key is missing.
    |
    */

    'default' => 'en',

    'fallback' => 'en',

    /*
    |--------------------------------------------------------------------------
    | Available Locales
    |--------------------------------------------------------------------------
    |
    | Every language the application knows about. Add a language by adding a row
    | here and dropping a matching folder under resources/js/localisation/{code}.
    | Set "enabled" to false to keep a language translated but hidden from the
    | language selector in the UI.
    |
    */

    'available' => [
        'en' => ['name' => 'English', 'native' => 'English', 'enabled' => true],
        'az' => ['name' => 'Azerbaijani', 'native' => 'Azərbaycan', 'enabled' => true],
    ],

];
