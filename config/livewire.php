<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Class Namespace
    |--------------------------------------------------------------------------
    |
    | This value determines the default namespace for newly generated Livewire
    | components. However, you are free to change this to anything you'd like.
    |
    */

    'class_namespace' => 'App\\Livewire',

    /*
    |--------------------------------------------------------------------------
    | View Path
    |--------------------------------------------------------------------------
    |
    | This value determines the default path for newly generated Livewire
    | views. However, you are free to change this to anything you'd like.
    |
    */

    'view_path' => resource_path('views/livewire'),

    /*
    |--------------------------------------------------------------------------
    | Layout
    |--------------------------------------------------------------------------
    |
    | The default layout view that will be used when rendering a component
    | as a single-page-application (SPA) via Route::get('/foo', Component::class).
    |
    */

    'layout' => 'components.layouts.app',

    /*
    |--------------------------------------------------------------------------
    | Temporary File Uploads
    |--------------------------------------------------------------------------
    |
    | Livewire handles file uploads by storing uploads in a temporary directory
    | until the form is submitted. Here you can configure the directory and
    | validation rules for those temporary uploads.
    |
    */

    'temporary_file_upload' => [
        'disk' => null,
        'rules' => 'file|max:30720', // Mengubah batas unggah maksimum menjadi 30MB (30720 KB)
        'directory' => null,
        'middleware' => null,
        'preview_mimes' => [
            'png', 'gif', 'bmp', 'svg', 'wav', 'mp4',
            'mov', 'avi', 'wmv', 'mp3', 'm4a', 'jpg',
            'jpeg', 'mpga', 'webp', 'wma',
        ],
        'max_upload_time' => 5, // minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Manifest Path
    |--------------------------------------------------------------------------
    |
    | This value determines the path to the Livewire manifest file. This file
    | is used to track where Livewire assets are located.
    |
    */

    'manifest_path' => null,

    /*
    |--------------------------------------------------------------------------
    | Back Button Cache
    |--------------------------------------------------------------------------
    |
    | This value determines whether Livewire will clear the browser's back button
    | cache when navigating between SPA pages.
    |
    */

    'back_button_cache' => false,

    /*
    |--------------------------------------------------------------------------
    | Render On Redirect
    |--------------------------------------------------------------------------
    |
    | This value determines whether Livewire will render the component after a
    | redirect has occurred.
    |
    */

    'render_on_redirect' => false,

];
