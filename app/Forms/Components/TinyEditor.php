<?php

namespace App\Forms\Components;

use Filament\Forms\Components\Field;

class TinyEditor extends Field
{
    protected string $view = 'filament.forms.components.tiny-editor';

    protected int $minHeight = 500;
    protected int $maxHeight = 900;
    protected bool $isDarkMode = true;

    public function minHeight(int $minHeight): static
    {
        $this->minHeight = $minHeight;

        return $this;
    }

    public function getMinHeight(): int
    {
        return $this->minHeight;
    }

    public function maxHeight(int $maxHeight): static
    {
        $this->maxHeight = $maxHeight;

        return $this;
    }

    public function getMaxHeight(): int
    {
        return $this->maxHeight;
    }
}
