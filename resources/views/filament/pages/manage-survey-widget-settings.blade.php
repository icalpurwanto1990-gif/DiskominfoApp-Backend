<x-filament-panels::page>
    <form wire:submit="save" class="space-y-6">
        {{ $this->form }}

        <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div class="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Perubahan akan otomatis tersinkronisasi ke <strong>SurveyWidget</strong> dan <strong>SurveyModal</strong> di halaman depan website.
            </div>
            <div class="flex flex-wrap items-center gap-3">
                @foreach ($this->getFormActions() as $action)
                    {{ $action }}
                @endforeach
            </div>
        </div>
    </form>
</x-filament-panels::page>
