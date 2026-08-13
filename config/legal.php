<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Terms Version
    |--------------------------------------------------------------------------
    |
    | The version of the Terms & Conditions and Privacy Policy that users are
    | currently asked to agree to. Bump this whenever either document changes
    | in a way that needs fresh consent, and every user whose stored version no
    | longer matches is asked to agree again the next time they open the app.
    |
    | Dates read better than sequence numbers here: support can tell at a glance
    | which wording a user actually agreed to. Keep this set to the later of the
    | two "Last updated" dates shown on the documents themselves, in
    | `resources/js/pages/legal/terms.tsx` and `.../privacy.tsx`.
    |
    */

    'terms_version' => env('LEGAL_TERMS_VERSION', '2026-07-19'),

];
