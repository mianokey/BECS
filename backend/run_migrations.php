<?php
// run_migrations.php

// Set your secret password here
$secretPassword = 'Admin@254';

// Check if password was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';

    if ($password === $secretPassword) {
        require __DIR__ . '/vendor/autoload.php';
        $app = require_once __DIR__ . '/bootstrap/app.php';

        // Run migrations
        \Illuminate\Support\Facades\Artisan::call('migrate', [
            '--force' => true
        ]);

        echo "<h3>Migrations completed successfully!</h3>";
        exit;
    } else {
        echo "<h3>Incorrect password!</h3>";
    }
}

// Show simple password form
?>
<form method="post" style="margin-top:50px;text-align:center;">
    <h2>Enter password to run migrations</h2>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Run Migrations</button>
</form>
