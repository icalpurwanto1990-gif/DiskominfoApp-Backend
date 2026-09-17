<?php

namespace App\Filament\Pages;

use App\Models\PopupModalSetting;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

class ManagePopupModalSettings extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected static ?string $slug = 'popup-settings';

    protected static ?string $navigationIcon = 'heroicon-o-window';

    protected static ?string $navigationLabel = 'Popup Pengumuman';

    protected static ?string $title = 'Kelola Popup Pengumuman & Poster Beranda';

    protected static ?string $navigationGroup = 'Konten Portal';

    protected static ?int $navigationSort = 4;

    protected static string $view = 'filament.pages.manage-popup-modal-settings';

    public static function canAccess(): bool
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        $role = strtoupper((string) ($user->role ?? ''));
        return in_array($role, ['SUPERADMIN', 'ADMIN']) || empty($role);
    }

    public ?array $data = [];

    public function mount(): void
    {
        $this->loadData();
    }

    protected function loadData(): void
    {
        $setting = PopupModalSetting::getActiveSetting();
        $formData = $setting->toArray();

        // Normalize image_url for Filament FileUpload
        if (!empty($formData['image_url'])) {
            $path = ltrim($formData['image_url'], '/');
            if (str_starts_with($path, 'uploads/')) {
                $formData['image_url'] = substr($path, 8);
            }
        }

        $this->form->fill($formData);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Pengaturan Tampilan & Perilaku')
                    ->description('Atur apakah popup otomatis diaktifkan di beranda serta tipe konten yang ingin dimunculkan.')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Aktifkan Popup Otomatis di Beranda')
                            ->helperText('Jika dinonaktifkan, tidak akan ada popup modal yang muncul saat pengunjung membuka/refresh website.')
                            ->default(false),

                        Forms\Components\Select::make('content_type')
                            ->label('Tipe Konten Popup')
                            ->options([
                                'IMAGE'        => '🖼️ Gambar Penuh / Poster Flyer (Rekomendasi)',
                                'ANNOUNCEMENT' => '📢 Kartu Pengumuman (Gambar + Teks + Tombol)',
                                'SURVEY'       => '📋 Formulir Survei Kepuasan Layanan',
                            ])
                            ->default('IMAGE')
                            ->required()
                            ->reactive(),

                        Forms\Components\TextInput::make('delay_seconds')
                            ->label('Waktu Tunda Kemunculan (Detik)')
                            ->numeric()
                            ->default(2)
                            ->minValue(1)
                            ->maxValue(30)
                            ->helperText('Berapa detik setelah halaman terbuka sebelum popup otomatis tampil.'),

                        Forms\Components\Toggle::make('show_once_per_session')
                            ->label('Tampilkan Hanya 1 Kali per Kunjungan (Session)')
                            ->default(false)
                            ->helperText('Jika aktif, pengunjung yang sudah menutup popup tidak akan melihatnya lagi saat me-refresh browser di sesi yang sama.'),
                    ])->columns(2),

                Forms\Components\Section::make('Berkas Poster / Flyer')
                    ->description('Unggah gambar poster pengumuman beresolusi tinggi.')
                    ->schema([
                        Forms\Components\FileUpload::make('image_url')
                            ->label('Berkas Poster / Gambar Full')
                            ->image()
                            ->disk('uploads')
                            ->directory('settings/popup')
                            ->maxSize(10240)
                            ->helperText('Format JPG, PNG, atau WebP. Rekomendasi rasio vertikal/portrait (4:5 atau 1:1) agar optimal di layar ponsel dan laptop.'),

                        Forms\Components\TextInput::make('link_url')
                            ->label('Tautan URL Tujuan (Opsional)')
                            ->placeholder('https://... atau /berita/judul-berita')
                            ->helperText('Jika diisi, pengunjung yang mengklik poster gambar akan otomatis diarahkan ke URL ini.'),
                    ]),

                Forms\Components\Section::make('Informasi Teks & Tombol (Opsional)')
                    ->description('Diperlukan jika Anda memilih tipe "Kartu Pengumuman" atau ingin menampilkan keterangan tambahan.')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Judul Pengumuman')
                            ->placeholder('Contoh: Peringatan Hari Jadi Kabupaten Banggai Kepulauan')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('button_text')
                            ->label('Teks Tombol Aksi (CTA)')
                            ->placeholder('Lihat Selengkapnya')
                            ->default('Lihat Selengkapnya'),

                        Forms\Components\Textarea::make('caption')
                            ->label('Keterangan Tambahan / Isi Pengumuman')
                            ->rows(3)
                            ->placeholder('Tuliskan rincian pengumuman singkat di sini...')
                            ->columnSpanFull(),
                    ])->columns(2),
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Perubahan Popup')
                ->icon('heroicon-o-check')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $state = $this->form->getState();

        $setting = PopupModalSetting::getActiveSetting();

        $imagePath = $setting->image_url;
        if (isset($state['image_url'])) {
            $imgVal = is_array($state['image_url']) ? reset($state['image_url']) : $state['image_url'];
            if (!empty($imgVal)) {
                $imagePath = str_starts_with($imgVal, '/') ? $imgVal : '/uploads/' . $imgVal;
            } elseif ($imgVal === null) {
                $imagePath = null;
            }
        }

        $setting->update([
            'is_active'             => (bool) ($state['is_active'] ?? false),
            'content_type'          => $state['content_type'] ?? 'IMAGE',
            'title'                 => $state['title'] ?? null,
            'image_url'             => $imagePath,
            'caption'               => $state['caption'] ?? null,
            'link_url'              => $state['link_url'] ?? null,
            'button_text'           => $state['button_text'] ?? 'Lihat Selengkapnya',
            'show_once_per_session' => (bool) ($state['show_once_per_session'] ?? false),
            'delay_seconds'         => (int) ($state['delay_seconds'] ?? 2),
        ]);

        $this->loadData();

        try {
            Cache::flush();
        } catch (\Throwable $e) {
            // Ignore
        }

        Notification::make()
            ->title('Pengaturan Popup Berhasil Disimpan!')
            ->body('Perubahan popup modal telah disimpan dan langsung aktif di halaman depan website.')
            ->success()
            ->send();
    }
}
