<?php

namespace App\Filament\Pages;

use App\Models\LeaderSetting;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class ManageLeaderSettings extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationLabel = 'Foto & Nama Pimpinan';

    protected static ?string $title = 'Kelola Foto & Nama Pimpinan (Bupati & Wakil Bupati)';

    protected static ?string $navigationGroup = 'Profil & Kepegawaian';

    protected static ?int $navigationSort = 2;

    protected static string $view = 'filament.pages.manage-leader-settings';

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
        $defaults = LeaderSetting::getDefaults();
        $dbSettings = LeaderSetting::all()->pluck('value', 'key')->toArray();

        $merged = array_merge($defaults, $dbSettings);

        // Normalize photo paths for Filament FileUpload component on disk 'uploads'
        foreach (['bupati_foto', 'wakil_bupati_foto', 'bupati_wakil_foto'] as $photoKey) {
            if (!empty($merged[$photoKey])) {
                $path = ltrim($merged[$photoKey], '/');
                if (str_starts_with($path, 'uploads/')) {
                    $merged[$photoKey] = substr($path, 8);
                } else {
                    $merged[$photoKey] = $path;
                }
            }
        }

        $this->form->fill($merged);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('LeaderSettingsTabs')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Informasi Bupati')
                            ->icon('heroicon-o-user')
                            ->schema([
                                Forms\Components\Section::make('Data Bupati')
                                    ->description('Atur nama, jabatan, dan foto resmi Bupati untuk ditampilkan pada Hero website.')
                                    ->schema([
                                        Forms\Components\TextInput::make('bupati_nama')
                                            ->label('Nama Lengkap Bupati')
                                            ->helperText('Contoh: H. Ihsan Basir, SH., LL.M.')
                                            ->required(),
                                        Forms\Components\TextInput::make('bupati_jabatan')
                                            ->label('Jabatan Bupati')
                                            ->helperText('Contoh: Pj. Bupati Banggai Kepulauan')
                                            ->required(),
                                        Forms\Components\FileUpload::make('bupati_foto')
                                            ->label('Foto Resmi Bupati')
                                            ->image()
                                            ->disk('uploads')
                                            ->directory('settings')
                                            ->helperText('Rekomendasi rasio 3:4 dengan background transparan/studio PNG.')
                                            ->maxSize(5120),
                                        Forms\Components\Toggle::make('bupati_aktif')
                                            ->label('Tampilkan Foto Card Bupati di Main Hero')
                                            ->default(true),
                                    ])->columns(2),
                            ]),

                        Forms\Components\Tabs\Tab::make('Informasi Wakil Bupati')
                            ->icon('heroicon-o-user')
                            ->schema([
                                Forms\Components\Section::make('Data Wakil Bupati')
                                    ->description('Atur nama, jabatan, dan foto resmi Wakil Bupati.')
                                    ->schema([
                                        Forms\Components\TextInput::make('wakil_bupati_nama')
                                            ->label('Nama Lengkap Wakil Bupati')
                                            ->helperText('Contoh: Drs. H. Nama Wakil Bupati, M.Si'),
                                        Forms\Components\TextInput::make('wakil_bupati_jabatan')
                                            ->label('Jabatan Wakil Bupati')
                                            ->helperText('Contoh: Wakil Bupati Banggai Kepulauan'),
                                        Forms\Components\FileUpload::make('wakil_bupati_foto')
                                            ->label('Foto Resmi Wakil Bupati')
                                            ->image()
                                            ->disk('uploads')
                                            ->directory('settings')
                                            ->helperText('Rekomendasi rasio 3:4 dengan background transparan/studio PNG.')
                                            ->maxSize(5120),
                                        Forms\Components\Toggle::make('wakil_bupati_aktif')
                                            ->label('Tampilkan Foto Card Wakil Bupati di Main Hero')
                                            ->default(true),
                                    ])->columns(2),
                            ]),

                        Forms\Components\Tabs\Tab::make('Foto Banner Berdua')
                            ->icon('heroicon-o-photo')
                            ->schema([
                                Forms\Components\Section::make('Foto Gabungan Bupati & Wakil Bupati')
                                    ->description('Unggah foto banner berdampingan yang digunakan pada tabel agenda pimpinan.')
                                    ->schema([
                                        Forms\Components\FileUpload::make('bupati_wakil_foto')
                                            ->label('Foto Pasangan/Gabungan')
                                            ->image()
                                            ->disk('uploads')
                                            ->directory('settings')
                                            ->helperText('Dipakai di bagian header Agenda Kegiatan Pimpinan.')
                                            ->maxSize(5120),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Perubahan Pimpinan')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $state = $this->form->getState();

        foreach ($state as $key => $value) {
            if (is_array($value)) {
                if (count($value) === 0) {
                    // Do not wipe existing photo path if state is empty array
                    continue;
                }
                $value = reset($value);
            }

            // Handle boolean values for toggles
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            if ($value === null || $value === false) {
                continue;
            }

            LeaderSetting::updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value]
            );
        }

        // Re-fill form from database so FileUpload components stay populated with the saved image paths
        $this->loadData();

        // Clear Laravel application cache so changes take effect immediately on public site
        try {
            \Illuminate\Support\Facades\Cache::flush();
        } catch (\Throwable $e) {
            // Ignore if cache driver does not support flush
        }

        Notification::make()
            ->title('Data Pimpinan Berhasil Diperbarui')
            ->body('Foto dan nama label Bupati/Wakil Bupati telah diperbarui di halaman publik.')
            ->success()
            ->send();
    }
}
