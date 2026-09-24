<x-dynamic-component
    :component="$getFieldWrapperView()"
    :field="$field"
>
    <div
        x-data="tinyEditor({
            state: $wire.entangle('{{ $getStatePath() }}'),
            statePath: '{{ $getStatePath() }}',
            minHeight: {{ $getMinHeight() }},
            maxHeight: {{ $getMaxHeight() }},
            uploadUrl: '{{ route('admin.editor.upload') }}',
            csrfToken: '{{ csrf_token() }}'
        })"
        x-init="initEditor()"
        wire:ignore
        class="w-full relative"
    >
        <textarea
            x-ref="editorTextArea"
            id="tiny-editor-{{ str_replace('.', '-', $getStatePath()) }}"
            class="hidden"
        >{!! $getState() !!}</textarea>
    </div>
</x-dynamic-component>

@assets
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js" referrerpolicy="origin"></script>
@endassets

@script
<script>
(() => {
    const register = () => {
        if (!window.Alpine) return;
        
        Alpine.data('tinyEditor', ({ state, statePath, minHeight, maxHeight, uploadUrl, csrfToken }) => ({
            state: state,
            editorInstance: null,

            initEditor() {
                const checkTiny = setInterval(() => {
                    if (typeof tinymce !== 'undefined') {
                        clearInterval(checkTiny);
                        this.mountTiny();
                    }
                }, 100);
            },

            mountTiny() {
                const textarea = this.$refs.editorTextArea;
                if (!textarea) return;

                const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');

                tinymce.init({
                    target: textarea,
                    min_height: minHeight || 500,
                    max_height: maxHeight || 900,
                    menubar: 'file edit view insert format tools table help',
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: [
                        'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
                        'alignleft aligncenter alignright alignjustify | lineheight outdent indent | bullist numlist | image media link table | removeformat code fullscreen'
                    ].join(' | '),
                    skin: isDark ? 'oxide-dark' : 'oxide',
                    content_css: isDark ? 'dark' : 'default',
                    object_resizing: true, // Enables interactive drag resize handles for images and tables
                    image_dimensions: true, // Enables width & height dimension inputs in the image dialog
                    image_advtab: true, // Enables margin, border, and style options
                    image_title: true,
                    image_caption: true,
                    automatic_uploads: true,
                    images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.withCredentials = false;
                        xhr.open('POST', uploadUrl);
                        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);

                        xhr.upload.onprogress = (e) => {
                            progress((e.loaded / e.total) * 100);
                        };

                        xhr.onload = () => {
                            if (xhr.status === 403 || xhr.status === 419) {
                                reject({ message: 'HTTP Error: Sesi login telah berakhir atau CSRF token kedaluwarsa.', remove: true });
                                return;
                            }

                            if (xhr.status < 200 || xhr.status >= 300) {
                                reject('HTTP Error: ' + xhr.status);
                                return;
                            }

                            try {
                                const json = JSON.parse(xhr.responseText);
                                if (!json || typeof json.location !== 'string') {
                                    reject('Format respons dari server tidak valid: ' + xhr.responseText);
                                    return;
                                }
                                resolve(json.location);
                            } catch (err) {
                                reject('Gagal membaca respons server: ' + err.message);
                            }
                        };

                        xhr.onerror = () => {
                            reject('Gagal menghubungi server saat mengunggah gambar.');
                        };

                        const formData = new FormData();
                        formData.append('file', blobInfo.blob(), blobInfo.filename());
                        xhr.send(formData);
                    }),
                    content_style: `
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            font-size: 14px;
                            line-height: 1.6;
                            color: ${isDark ? '#e2e8f0' : '#1e293b'};
                            background-color: ${isDark ? '#0f172a' : '#ffffff'};
                            padding: 12px;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            display: inline-block;
                            border-radius: 6px;
                        }
                        img[style*="float: left"] {
                            float: left;
                            margin-right: 16px;
                            margin-bottom: 12px;
                        }
                        img[style*="float: right"] {
                            float: right;
                            margin-left: 16px;
                            margin-bottom: 12px;
                        }
                        p[style*="text-align: justify"], div[style*="text-align: justify"] {
                            text-align: justify;
                        }
                    `,
                    setup: (editor) => {
                        this.editorInstance = editor;

                        editor.on('init', () => {
                            if (this.state) {
                                editor.setContent(this.state);
                            }
                        });

                        // Update Livewire state on content change
                        const updateState = () => {
                            const content = editor.getContent();
                            if (this.state !== content) {
                                this.state = content;
                            }
                        };

                        editor.on('change', updateState);
                        editor.on('input', updateState);
                        editor.on('undo', updateState);
                        editor.on('redo', updateState);
                        editor.on('NodeChange', updateState);
                    }
                });

                // Watch for Livewire updates (e.g. form reset or prefilled data)
                this.$watch('state', (newContent) => {
                    if (this.editorInstance && newContent !== this.editorInstance.getContent()) {
                        this.editorInstance.setContent(newContent || '');
                    }
                });
            },

            destroy() {
                if (this.editorInstance) {
                    this.editorInstance.destroy();
                    this.editorInstance = null;
                }
            }
        }));
    };

    if (window.Alpine) {
        register();
    } else {
        document.addEventListener('alpine:init', register);
    }
})();
</script>
@endscript
