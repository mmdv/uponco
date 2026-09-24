<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Booking page design switching
    |--------------------------------------------------------------------------
    |
    | Whether admins can choose which design their public booking page uses on
    | the brand page. While the newer design is still being built this stays on
    | in local/staging and off in production, so live teams keep the classic
    | design until we flip BOOKING_DESIGN_SWITCHING on for production.
    |
    */

    'design_switching' => (bool) env('BOOKING_DESIGN_SWITCHING', env('APP_ENV', 'production') !== 'production'),

];
