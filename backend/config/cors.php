<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Replace '*' with your frontend origin
    'allowed_origins' => ['http://localhost:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Allow sending cookies or Authorization headers
    'supports_credentials' => true,

];


