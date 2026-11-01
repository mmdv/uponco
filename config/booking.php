<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Booking page design switching
    |--------------------------------------------------------------------------
    |
    | Whether admins can choose which design their public booking page uses on
    | the brand page. This is on in every environment; set
    | BOOKING_DESIGN_SWITCHING=false to hide the choice again. Teams that never
    | pick a design keep the classic one.
    |
    */

    'design_switching' => (bool) env('BOOKING_DESIGN_SWITCHING', true),

];
