<?php

namespace App\Filament\Pages;

use App\Models\SurveyWidgetSetting;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

class ManageSurveyWidgetSettings extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected static ?string $slug = 'survey';

    protected static ?string $navigationIcon = 'heroicon-o-adjustments-horizontal';

    protected static ?string $navigationLabel = 'Pengaturan Survey Widget';

    protected static ?string $title = 'Pengaturan Tampilan Survey Widget';

    protected static ?string $navigationGroup = 'Layanan Publik';

    protected static ?int $navigationSort = 2;

    protected static string $view = 'filament.pages.manage-survey-widget-settings';

    public static function canAccess(): bool
    {
        $user = auth()->user();
        return $user && in_array($user->role, ['SUPERADMIN', 'ADMIN']);
    }

    public ?array $data = [];

    public function mount(): void
    {
        $this->loadData();
    }

    protected function loadData(): void
    {
        $setting = SurveyWidgetSetting::getActiveSettings();
        $formData = $setting->toArray();

        // Normalize qr_image path for Filament FileUpload
        if (!empty($formData['qr_image'])) {
            $path = ltrim($formData['qr_image'], '/');
            if (str_starts_with($path, 'uploads/')) {
                $formData['qr_image'] = substr($path, 8);
            }
        }

        $this->form->fill($formData);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Visibilitas & Informasi Utama')
                    ->description('Atur apakah survey widget ditampilkan di halaman depan portal serta judul utamanya.')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Tampilkan Survey Widget di Halaman Depan Website')
                            ->helperText('Jika dinonaktifkan, widget survey di halaman beranda tidak akan dirender.')
                            ->default(true),
                        Forms\Components\TextInput::make('title')
                            ->label('Judul Survey Widget')
                            ->required()
                            ->maxLength(255)
                            ->default('Survey Kepuasan Masyarakat')
                            ->helperText('Contoh: Survey Kepuasan Masyarakat Diskominfo Bangkep'),
                        Forms\Components\Textarea::make('subtitle')
                            ->label('Subjudul / Kalimat Ajakan')
                            ->rows(2)
                            ->maxLength(500)
                            ->default('Bantu kami meningkatkan pelayanan publik dengan memberikan penilaian Anda.'),
                    ]),

                Forms\Components\Section::make('Pengaturan QR Code Survei')
                    ->description('Sesuaikan gambar QR Code dan keterangan teks panduan scan via ponsel.')
                    ->schema([
                        Forms\Components\Toggle::make('show_qr')
                            ->label('Tampilkan Kotak QR Code')
                            ->default(true)
                            ->helperText('Aktifkan untuk menampilkan QR Code di sebelah formulir rating.'),
                        Forms\Components\FileUpload::make('qr_image')
                            ->label('Berkas Gambar QR Code')
                            ->image()
                            ->disk('uploads')
                            ->directory('settings')
                            ->helperText('Format PNG, JPG, atau WebP. Jika dikosongkan, sistem memakai QR code bawaan (/images/survey-qr.png).')
                            ->maxSize(5120),
                        Forms\Components\Textarea::make('qr_caption')
                            ->label('Keterangan di Bawah QR Code')
                            ->rows(2)
                            ->default('📱 Scan QR untuk mengisi survey via ponsel'),
                        Forms\Components\TextInput::make('qr_link')
                            ->label('Tautan Eksternal Saat QR Code Diklik (Opsional)')
                            ->placeholder('https://forms.gle/... atau https://...')
                            ->url()
                            ->helperText('Jika diisi, pengunjung yang mengklik gambar QR Code di browser akan diarahkan ke tautan ini.'),
                    ])->columns(2),

                Forms\Components\Section::make('Pesan Sukses (Thank You Card)')
                    ->description('Tampilan pesan setelah responden berhasil mengirim penilaian survey.')
                    ->schema([
                        Forms\Components\TextInput::make('thank_you_title')
                            ->label('Judul Pesan Sukses')
                            ->default('Terima Kasih!')
                            ->required(),
                        Forms\Components\Textarea::make('thank_you_message')
                            ->label('Isi Pesan Terima Kasih')
                            ->rows(3)
                            ->default('Umpan balik Anda telah kami terima. Data ini sangat berharga untuk meningkatkan kualitas pelayanan publik digital di Kabupaten Banggai Kepulauan.'),
                    ]),
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Perubahan Survey Widget')
                ->icon('heroicon-o-check')
                ->submit('save'),
            Action::make('manageCategories')
                ->label('Kelola Kategori Layanan')
                ->icon('heroicon-o-list-bullet')
                ->color('gray')
                ->url('/admin/survey-categories'),
            Action::make('viewResponses')
                ->label('Lihat Respon Survey')
                ->icon('heroicon-o-chart-bar')
                ->color('gray')
                ->url('/admin/survey-responses'),
        ];
    }

    public function save(): void
    {
        $state = $this->form->getState();

        $setting = SurveyWidgetSetting::getActiveSettings();

        // Handle uploaded image path
        $qrImagePath = $setting->qr_image;
        if (isset($state['qr_image'])) {
            if (is_array($state['qr_image'])) {
                $qrVal = reset($state['qr_image']);
            } else {
                $qrVal = $state['qr_image'];
            }

            if (!empty($qrVal)) {
                $qrImagePath = str_starts_with($qrVal, '/') ? $qrVal : '/uploads/' . $qrVal;
            } elseif ($qrVal === null) {
                $qrImagePath = null;
            }
        }

        $setting->update([
            'title'             => $state['title'] ?? 'Survey Kepuasan Masyarakat',
            'subtitle'          => $state['subtitle'] ?? '',
            'qr_image'          => $qrImagePath,
            'qr_caption'        => $state['qr_caption'] ?? '',
            'qr_link'           => $state['qr_link'] ?? null,
            'show_qr'           => (bool) ($state['show_qr'] ?? true),
            'thank_you_title'   => $state['thank_you_title'] ?? 'Terima Kasih!',
            'thank_you_message' => $state['thank_you_message'] ?? '',
            'is_active'         => (bool) ($state['is_active'] ?? true),
        ]);

        $this->loadData();

        try {
            Cache::flush();
        } catch (\Throwable $e) {
            // Ignore if cache driver doesn't support flush
        }

        Notification::make()
            ->title('Pengaturan Survey Widget Berhasil Disimpan!')
            ->body('Perubahan judul, QR code, dan tampilan telah diperbarui dan langsung aktif pada website.')
            ->success()
            ->send();
    }
}
