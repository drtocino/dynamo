import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../core/i18n';
import { LanguageCode, LanguageOption } from '../../../../core/i18n/translation.types';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left select-none">
      <div class="flex items-center gap-1.5 p-1 bg-white border-3 border-neo-black rounded-xl shadow-[3px_3px_0px_#121212]">
        <button
          *ngFor="let opt of translationService.supportedLanguages"
          type="button"
          (click)="selectLanguage(opt.code)"
          [class.bg-neo-yellow]="translationService.currentLang() === opt.code"
          [class.text-neo-black]="translationService.currentLang() === opt.code"
          [class.bg-transparent]="translationService.currentLang() !== opt.code"
          [class.text-neo-black]="translationService.currentLang() !== opt.code"
          class="px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 border-2"
          [class.border-neo-black]="translationService.currentLang() === opt.code"
          [class.border-transparent]="translationService.currentLang() !== opt.code">
          <span class="text-sm leading-none">{{ opt.flag }}</span>
          <span class="uppercase tracking-wider">{{ opt.shortCode }}</span>
        </button>
      </div>
    </div>
  `
})
export class LanguageSelectorComponent {
  readonly translationService = inject(TranslationService);

  selectLanguage(code: LanguageCode): void {
    this.translationService.setLanguage(code);
  }
}
