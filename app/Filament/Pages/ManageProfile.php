<?php

namespace App\Filament\Pages;

use App\Models\ProfileContent;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class ManageProfile extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationLabel = 'Profil Dinas';

    protected static ?string $title = 'Kelola Profil Dinas';

    protected static ?string $navigationGroup = 'Profil & Kepegawaian';

    protected static ?int $navigationSort = 1;

    protected static string $view = 'filament.pages.manage-profile';

    public ?array $data = [];

    public function mount(): void
    {
        $profileContent = ProfileContent::all()->pluck('value', 'key')->toArray();
        $this->form->fill($profileContent);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Tabs')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Sambutan Kepala Dinas')
                            ->schema([
                                Forms\Components\TextInput::make('sambutan_nama')
                                    ->label('Nama Kepala Dinas')
                                    ->required(),
                                Forms\Components\TextInput::make('sambutan_jabatan')
                                    ->label('Jabatan')
                                    ->required(),
                                Forms\Components\Textarea::make('sambutan_teks')
                                    ->label('Teks Sambutan')
                                    ->rows(5)
                                    ->required(),
                                Forms\Components\FileUpload::make('sambutan_foto')
                                    ->image()
                                    ->disk('uploads')
                                    ->directory('profile')
                                    ->label('Foto Kepala Dinas'),
                            ]),
                        Forms\Components\Tabs\Tab::make('Visi & Misi')
                            ->schema([
                                Forms\Components\Textarea::make('visi_kabupaten')
                                    ->label('Visi Kabupaten')
                                    ->rows(3)
                                    ->required(),
                                Forms\Components\Textarea::make('misi_diskominfo')
                                    ->label('Misi Diskominfo')
                                    ->helperText('Gunakan tag <br/> untuk pemisah baris misi.')
                                    ->rows(5)
                                    ->required(),
                            ]),
                        Forms\Components\Tabs\Tab::make('Tugas & Fungsi (Tupoksi)')
                            ->schema([
                                Forms\Components\Textarea::make('tupoksi_tugas')
                                    ->label('Tugas Pokok')
                                    ->rows(3)
                                    ->required(),
                                Forms\Components\Section::make('Fungsi Perumusan Kebijakan')
                                    ->schema([
                                        Forms\Components\TextInput::make('tupoksi_fungsi_1_title')
                                            ->label('Judul Fungsi 1')
                                            ->required(),
                                        Forms\Components\Textarea::make('tupoksi_fungsi_1_desc')
                                            ->label('Deskripsi Fungsi 1')
                                            ->rows(3)
                                            ->required(),
                                    ]),
                                Forms\Components\Section::make('Fungsi Pelaksanaan & Pengawasan')
                                    ->schema([
                                        Forms\Components\TextInput::make('tupoksi_fungsi_2_title')
                                            ->label('Judul Fungsi 2')
                                            ->required(),
                                        Forms\Components\Textarea::make('tupoksi_fungsi_2_desc')
                                            ->label('Deskripsi Fungsi 2')
                                            ->rows(3)
                                            ->required(),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Struktur Organisasi')
                            ->schema([
                                Forms\Components\FileUpload::make('struktur_organisasi_foto')
                                    ->image()
                                    ->disk('uploads')
                                    ->directory('profile')
                                    ->label('Gambar Struktur Organisasi')
                                    ->helperText('Unggah gambar bagan struktur organisasi (Rekomendasi format PNG/JPG transparan)'),
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
                ->label('Simpan Perubahan')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $state = $this->form->getState();

        foreach ($state as $key => $value) {
            if (is_array($value)) {
                $value = reset($value);
            }

            ProfileContent::updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '']
            );
        }

        Notification::make()
            ->title('Profil Dinas Berhasil Diperbarui')
            ->success()
            ->send();
    }
}
