<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Category
        if (!Schema::hasTable('Category')) {
            Schema::create('Category', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name')->unique();
                $table->string('slug')->unique();
                $table->boolean('isMenu')->default(false);
                $table->integer('orderIndex')->default(0);
            });
        }

        // 2. Tag
        if (!Schema::hasTable('Tag')) {
            Schema::create('Tag', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name')->unique();
                $table->string('slug')->unique();
            });
        }

        // 3. Post
        if (!Schema::hasTable('Post')) {
            Schema::create('Post', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('content');
                $table->string('image')->nullable();
                $table->boolean('published')->default(false);
                $table->integer('views')->default(0);
                $table->uuid('authorId');
                $table->uuid('categoryId');
                $table->string('seoTitle')->nullable();
                $table->string('seoDesc')->nullable();
                $table->string('seoKeywords')->nullable();
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();

                $table->foreign('authorId')->references('id')->on('User')->onDelete('cascade');
                $table->foreign('categoryId')->references('id')->on('Category')->onDelete('cascade');
            });
        }

        // 4. _PostTags (Pivot table)
        if (!Schema::hasTable('_PostTags')) {
            Schema::create('_PostTags', function (Blueprint $table) {
                $table->uuid('A');
                $table->uuid('B');

                $table->unique(['A', 'B']);
                $table->index('B');

                $table->foreign('A')->references('id')->on('Post')->onDelete('cascade');
                $table->foreign('B')->references('id')->on('Tag')->onDelete('cascade');
            });
        }

        // 5. Document
        if (!Schema::hasTable('Document')) {
            Schema::create('Document', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title');
                $table->string('category');
                $table->string('fileUrl');
                $table->string('fileSize');
                $table->integer('downloads')->default(0);
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 6. PPIDRequest
        if (!Schema::hasTable('PPIDRequest')) {
            Schema::create('PPIDRequest', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('ticketNumber')->unique();
                $table->string('name');
                $table->string('nik');
                $table->string('email');
                $table->string('phone');
                $table->string('address');
                $table->text('details');
                $table->text('purpose');
                $table->string('ktpFile');
                $table->string('status')->default('PENDING'); // PENDING, DIPROSES, SELESAI, DITOLAK
                $table->text('response')->nullable();
                $table->string('attachment')->nullable();
                $table->uuid('assignedToId')->nullable();
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();

                $table->foreign('assignedToId')->references('id')->on('User')->onDelete('set null');
            });
        }

        // 7. PPIDObjection
        if (!Schema::hasTable('PPIDObjection')) {
            Schema::create('PPIDObjection', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('requestId')->unique();
                $table->text('reason');
                $table->string('ktpFile');
                $table->string('status')->default('PENDING');
                $table->text('response')->nullable();
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();

                $table->foreign('requestId')->references('id')->on('PPIDRequest')->onDelete('cascade');
            });
        }

        // 8. ServiceRequest
        if (!Schema::hasTable('ServiceRequest')) {
            Schema::create('ServiceRequest', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('serviceType');
                $table->string('ticketNumber')->unique();
                $table->string('applicantName');
                $table->string('applicantEmail');
                $table->string('applicantPhone');
                $table->string('instansi');
                $table->json('details');
                $table->string('status')->default('PENDING');
                $table->text('notes')->nullable();
                $table->uuid('handledById')->nullable();
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();

                $table->foreign('handledById')->references('id')->on('User')->onDelete('set null');
            });
        }

        // 9. GISInfrastructure
        if (!Schema::hasTable('GISInfrastructure')) {
            Schema::create('GISInfrastructure', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('type'); // GISType enum in prisma
                $table->double('latitude');
                $table->double('longitude');
                $table->string('status');
                $table->json('details');
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 10. Dataset
        if (!Schema::hasTable('Dataset')) {
            Schema::create('Dataset', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('description');
                $table->string('category');
                $table->json('metadata');
                $table->string('fileUrl');
                $table->json('jsonData');
                $table->integer('downloads')->default(0);
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 11. SurveyResponse
        if (!Schema::hasTable('SurveyResponse')) {
            Schema::create('SurveyResponse', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->integer('rating');
                $table->text('comment')->nullable();
                $table->string('category');
                $table->timestamp('createdAt')->nullable();
            });
        }

        // 12. AppStatistic
        if (!Schema::hasTable('AppStatistic')) {
            Schema::create('AppStatistic', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('key')->unique();
                $table->integer('value');
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 13. ProfileContent
        if (!Schema::hasTable('ProfileContent')) {
            Schema::create('ProfileContent', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('key')->unique();
                $table->text('value');
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 14. Staff
        if (!Schema::hasTable('Staff')) {
            Schema::create('Staff', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('gelarDepan')->nullable();
                $table->string('gelarBelakang')->nullable();
                $table->string('nip')->unique();
                $table->string('position');
                $table->string('category');
                $table->string('image')->nullable();
                $table->integer('orderIndex')->default(0);
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 15. Banner
        if (!Schema::hasTable('Banner')) {
            Schema::create('Banner', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('imageUrl');
                $table->string('linkUrl')->nullable();
                $table->boolean('active')->default(true);
                $table->integer('orderIndex')->default(0);
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 16. Media
        if (!Schema::hasTable('Media')) {
            Schema::create('Media', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title');
                $table->string('type'); // MediaType enum in prisma
                $table->string('url')->nullable();
                $table->string('meta');
                $table->timestamp('createdAt')->nullable();
                $table->timestamp('updatedAt')->nullable();
            });
        }

        // 17. ContactComplaint
        if (!Schema::hasTable('ContactComplaint')) {
            Schema::create('ContactComplaint', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('phone');
                $table->string('email');
                $table->string('subject');
                $table->text('message');
                $table->string('status')->default('PENDING'); // PENDING, DIPROSES, SELESAI
                $table->text('response')->nullable();
                $table->timestamp('createdAt')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ContactComplaint');
        Schema::dropIfExists('Media');
        Schema::dropIfExists('Banner');
        Schema::dropIfExists('Staff');
        Schema::dropIfExists('ProfileContent');
        Schema::dropIfExists('AppStatistic');
        Schema::dropIfExists('SurveyResponse');
        Schema::dropIfExists('Dataset');
        Schema::dropIfExists('GISInfrastructure');
        Schema::dropIfExists('ServiceRequest');
        Schema::dropIfExists('PPIDObjection');
        Schema::dropIfExists('PPIDRequest');
        Schema::dropIfExists('Document');
        Schema::dropIfExists('_PostTags');
        Schema::dropIfExists('Post');
        Schema::dropIfExists('Tag');
        Schema::dropIfExists('Category');
    }
};
