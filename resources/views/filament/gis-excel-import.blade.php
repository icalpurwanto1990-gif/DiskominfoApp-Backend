{{--
    Blade view untuk komponen upload Excel GIS dalam Filament modal.
    Menggunakan SheetJS (CDN) via Alpine.js untuk parse file di browser,
    lalu menyimpan JSON ke Livewire state via $wire.set() agar bisa
    dibaca oleh Filament Action saat form di-submit.
--}}

<div
    x-data="{
        fileName: '',
        rows: [],
        parseErrors: [],
        isLoading: false,
        isDragging: false,
        showErrors: false,
        progress: 0,

        typeAliases: {
            'bts': 'BTS_TOWER', 'bts tower': 'BTS_TOWER', 'bts_tower': 'BTS_TOWER', 'menara': 'BTS_TOWER',
            'blankspot': 'BLANKSPOT', 'blank spot': 'BLANKSPOT', 'no signal': 'BLANKSPOT',
            'vsat': 'VSAT', 'satelit': 'VSAT', 'satellite': 'VSAT',
            'fiber optik': 'FIBER_OPTIK', 'fiber_optik': 'FIBER_OPTIK', 'fiber': 'FIBER_OPTIK', 'fo': 'FIBER_OPTIK'
        },
        validTypes: ['BTS_TOWER', 'BLANKSPOT', 'VSAT', 'FIBER_OPTIK'],

        normalizeType(raw) {
            if (!raw) return null;
            const key = String(raw).toLowerCase().trim();
            if (this.typeAliases[key]) return this.typeAliases[key];
            const upper = key.toUpperCase();
            return this.validTypes.includes(upper) ? upper : null;
        },

        loadSheetJs() {
            return new Promise((resolve, reject) => {
                if (window.XLSX) return resolve(window.XLSX);
                const s = document.createElement('script');
                s.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
                s.onload = () => resolve(window.XLSX);
                s.onerror = () => reject(new Error('Gagal memuat SheetJS. Periksa koneksi internet.'));
                document.head.appendChild(s);
            });
        },

        async parseFile(file) {
            if (!file) return;
            const ext = file.name.split('.').pop().toLowerCase();
            if (!['xlsx','xls','csv'].includes(ext)) {
                alert('Format tidak didukung. Gunakan .xlsx, .xls, atau .csv');
                return;
            }
            this.isLoading = true;
            this.progress = 10;
            this.rows = [];
            this.parseErrors = [];
            this.fileName = file.name;
            try {
                const XLSX = await this.loadSheetJs();
                this.progress = 40;
                const buf = await file.arrayBuffer();
                this.progress = 65;
                const wb = XLSX.read(buf, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
                this.progress = 85;

                const validRows = [];
                const errRows = [];
                raw.forEach((r, idx) => {
                    const rowNum = idx + 2;
                    const errs = [];
                    const name = String(r['name'] || r['Nama'] || r['nama'] || '').trim();
                    if (!name) errs.push('Kolom name kosong');
                    const rawType = r['type'] || r['Type'] || r['tipe'] || r['Tipe'] || '';
                    const type = this.normalizeType(rawType);
                    if (!type) errs.push('Tipe [' + rawType + '] tidak valid');
                    const lat = parseFloat(r['latitude'] || r['Latitude'] || r['lat'] || 0);
                    const lng = parseFloat(r['longitude'] || r['Longitude'] || r['lng'] || 0);
                    if (isNaN(lat) || lat < -90 || lat > 90) errs.push('Latitude tidak valid');
                    if (isNaN(lng) || lng < -180 || lng > 180) errs.push('Longitude tidak valid');

                    if (errs.length > 0) {
                        errRows.push({ row: rowNum, name: name || ('Baris ' + rowNum), errors: errs });
                    } else {
                        validRows.push({
                            name,
                            type,
                            latitude: lat,
                            longitude: lng,
                            status: String(r['status'] || r['Status'] || 'AKTIF').toUpperCase().trim() || 'AKTIF',
                            description: String(r['description'] || r['Description'] || r['deskripsi'] || '').trim(),
                            image: String(r['image'] || r['Image'] || r['foto'] || r['Foto'] || r['gambar'] || r['Gambar'] || '').trim()
                        });
                    }
                });

                this.rows = validRows;
                this.parseErrors = errRows;
                this.progress = 100;

                // Sync ke Livewire state agar Filament Action bisa baca saat submit
                this.$wire.set('data.import_rows_json', JSON.stringify(validRows));

            } catch(e) {
                alert('Gagal membaca file: ' + e.message);
            } finally {
                this.isLoading = false;
                setTimeout(() => { this.progress = 0; }, 800);
            }
        },

        onDrop(e) {
            this.isDragging = false;
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) this.parseFile(file);
        },

        onFileChange(e) {
            const file = e.target.files && e.target.files[0];
            if (file) this.parseFile(file);
        },

        downloadTemplate() {
            this.loadSheetJs().then(XLSX => {
                const ws = XLSX.utils.aoa_to_sheet([
                    ['name','type','latitude','longitude','status','description','image'],
                    ['BTS Menara Salakan','BTS_TOWER',-1.3597,123.5671,'AKTIF','Telkomsel, tinggi 42m',''],
                    ['VSAT Desa Tatakalai','VSAT',-1.4123,123.6012,'AKTIF','',''],
                    ['Blankspot Kec. Bulagi','BLANKSPOT',-1.5001,123.4801,'BERMASALAH','Area tanpa sinyal',''],
                    ['Fiber Optik Jl. Poros','FIBER_OPTIK',-1.3421,123.5500,'NORMAL','Kabel tanah 1.2km','']
                ]);
                ws['!cols'] = [{wch:35},{wch:14},{wch:12},{wch:13},{wch:12},{wch:35},{wch:25}];
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'GIS Import');
                XLSX.writeFile(wb, 'template_import_gis.xlsx');
            }).catch(e => alert('Gagal memuat library: ' + e.message));
        }
    }"
    class="space-y-4"
>
    {{-- ── Drop Zone ───────────────────────────────────────────────────── --}}
    <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop($event)"
        @click="$refs.fileInput.click()"
        :class="isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20' : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/30'"
        class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all min-h-[140px] justify-center"
    >
        <input type="file" x-ref="fileInput" accept=".xlsx,.xls,.csv" class="hidden" @change="onFileChange($event)" />

        {{-- Loading state --}}
        <div x-show="isLoading" class="flex flex-col items-center gap-2 w-full">
            <div class="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500 rounded-full transition-all duration-300" :style="'width: ' + progress + '%'"></div>
            </div>
            <p class="text-sm text-gray-500">Memproses file... <span x-text="progress"></span>%</p>
        </div>

        {{-- Empty state --}}
        <div x-show="!isLoading && !fileName" class="flex flex-col items-center gap-3">
            <div class="p-3 bg-primary-50 dark:bg-primary-950/30 text-primary-600 rounded-xl">
                @svg('heroicon-o-document-arrow-up', 'w-8 h-8')
            </div>
            <div class="text-center">
                <p class="font-semibold text-gray-700 dark:text-gray-300">Seret &amp; lepas file Excel di sini</p>
                <p class="text-sm text-gray-400 mt-1">atau klik untuk memilih file (.xlsx, .xls, .csv)</p>
            </div>
            <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">Maks. 2000 baris data</span>
        </div>

        {{-- File selected state --}}
        <div x-show="!isLoading && fileName" class="flex flex-col items-center gap-1">
            <div class="p-2 text-success-600 rounded-xl">
                @svg('heroicon-o-check-circle', 'w-7 h-7 text-success-500')
            </div>
            <p class="font-bold text-sm text-gray-800 dark:text-gray-200" x-text="fileName"></p>
            <p class="text-xs text-gray-400">Klik untuk ganti file</p>
        </div>
    </div>

    {{-- ── Statistik parse hasil ───────────────────────────────────────── --}}
    <div x-show="fileName && !isLoading" class="grid grid-cols-3 gap-3">
        <div class="bg-success-50 dark:bg-success-950/20 border border-success-200/50 rounded-xl p-3 text-center">
            <div class="text-2xl font-black text-success-600" x-text="rows.length"></div>
            <div class="text-xs font-bold text-success-600 uppercase tracking-wider">Baris Valid</div>
        </div>
        <div class="bg-danger-50 dark:bg-danger-950/20 border border-danger-200/50 rounded-xl p-3 text-center">
            <div class="text-2xl font-black text-danger-600" x-text="parseErrors.length"></div>
            <div class="text-xs font-bold text-danger-600 uppercase tracking-wider">Baris Error</div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200/60 rounded-xl p-3 text-center">
            <div class="text-2xl font-black text-gray-700 dark:text-gray-200" x-text="rows.length + parseErrors.length"></div>
            <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Baris</div>
        </div>
    </div>

    {{-- ── Error log ──────────────────────────────────────────────────── --}}
    <div x-show="parseErrors.length > 0" class="bg-danger-50 dark:bg-danger-950/20 border border-danger-200/50 rounded-xl overflow-hidden">
        <button type="button" @click="showErrors = !showErrors"
            class="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-danger-700 dark:text-danger-400">
            <span x-text="parseErrors.length + ' baris akan dilewati karena data tidak valid'"></span>
            <span x-text="showErrors ? '▲' : '▼'"></span>
        </button>
        <div x-show="showErrors" class="px-4 pb-3 space-y-1 max-h-36 overflow-y-auto">
            <template x-for="e in parseErrors" :key="e.row">
                <p class="text-xs text-danger-600 dark:text-danger-400">
                    <strong x-text="'Baris ' + e.row + ' (' + e.name + '):'"></strong>
                    <span x-text="e.errors.join('; ')"></span>
                </p>
            </template>
        </div>
    </div>

    {{-- ── Preview tabel ──────────────────────────────────────────────── --}}
    <div x-show="rows.length > 0" class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Preview Data yang Akan Diimpor</span>
        </div>
        <div class="overflow-x-auto max-h-48">
            <table class="w-full text-xs">
                <thead class="sticky top-0 bg-white dark:bg-gray-900">
                    <tr class="border-b border-gray-200 dark:border-gray-700 text-gray-400 uppercase tracking-wider font-bold">
                        <th class="p-2 text-left">#</th>
                        <th class="p-2 text-left">Nama</th>
                        <th class="p-2 text-left">Tipe</th>
                        <th class="p-2 text-left">Lat</th>
                        <th class="p-2 text-left">Lng</th>
                        <th class="p-2 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="(row, i) in rows" :key="i">
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="p-2 text-gray-400" x-text="i + 1"></td>
                            <td class="p-2 font-semibold text-gray-800 dark:text-gray-200" x-text="row.name"></td>
                            <td class="p-2">
                                <span class="px-1.5 py-0.5 bg-info-100 text-info-700 rounded text-xs font-bold uppercase" x-text="row.type"></span>
                            </td>
                            <td class="p-2 font-mono text-gray-500" x-text="row.latitude"></td>
                            <td class="p-2 font-mono text-gray-500" x-text="row.longitude"></td>
                            <td class="p-2">
                                <span
                                    :class="(row.status === 'AKTIF' || row.status === 'NORMAL') ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'"
                                    class="px-1.5 py-0.5 rounded text-xs font-bold uppercase"
                                    x-text="row.status"
                                ></span>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>

    {{-- ── Format guide + template download ──────────────────────────── --}}
    <div class="bg-info-50 dark:bg-info-950/20 border border-info-200/50 dark:border-info-800/40 rounded-xl p-4 space-y-2">
        <p class="text-xs font-bold text-info-700 dark:text-info-400 uppercase tracking-wider">📋 Format Kolom yang Dibutuhkan</p>
        <div class="overflow-x-auto">
            <table class="text-xs text-gray-600 dark:text-gray-400 w-full">
                <thead>
                    <tr class="text-info-600 dark:text-info-400 font-bold">
                        <th class="text-left pr-4 pb-1">name *</th>
                        <th class="text-left pr-4 pb-1">type *</th>
                        <th class="text-left pr-4 pb-1">latitude *</th>
                        <th class="text-left pr-4 pb-1">longitude *</th>
                        <th class="text-left pr-4 pb-1">status</th>
                        <th class="text-left pr-4 pb-1">description</th>
                        <th class="text-left pb-1">image</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="pr-4">BTS Menara Salakan</td>
                        <td class="pr-4">BTS_TOWER</td>
                        <td class="pr-4 font-mono">-1.3597</td>
                        <td class="pr-4 font-mono">123.5671</td>
                        <td class="pr-4">AKTIF</td>
                        <td class="pr-4">Tinggi 42m</td>
                        <td class="font-mono text-[10px]">gis/bts-salakan.jpg</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-xs text-info-600 font-semibold">
            Tipe valid: <strong>BTS_TOWER</strong> · <strong>VSAT</strong> · <strong>FIBER_OPTIK</strong> · <strong>BLANKSPOT</strong> (Kolom <em>image</em> opsional)
        </p>
        <button type="button" @click.prevent="downloadTemplate()"
            class="text-xs font-bold text-info-600 hover:text-info-800 dark:hover:text-info-300 underline mt-1">
            ⬇ Download Template Excel
        </button>
    </div>
</div>
