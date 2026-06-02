<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Set allowed_origins to your frontend domain(s) in production.
    | e.g. ['https://horizonooh.com', 'https://www.horizonooh.com']
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Cache preflight OPTIONS response for 24 h — eliminates repeat round-trips
    // on every API call from browsers that re-issue preflight on every session.
    'max_age' => 86400,

    'supports_credentials' => false,

];
