<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\DigitalService;

header('Content-Type: application/json');
echo json_encode(DigitalService::all(), JSON_PRETTY_PRINT);
