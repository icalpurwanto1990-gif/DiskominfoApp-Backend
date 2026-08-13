<?php
$source = 'C:/Users/ICHACKER/.gemini/antigravity-ide/brain/c045fc14-f533-44fe-9abe-185bbce6adfe/media__1786581317365.png';
$dest = __DIR__ . '/public/images/mymoe-logo.png';

if (file_exists($source)) {
    if (copy($source, $dest)) {
        echo "SUCCESS: Copied logo to " . $dest . "\n";
    } else {
        echo "ERROR: Failed to copy.\n";
    }
} else {
    echo "ERROR: Source not found at " . $source . "\n";
}
