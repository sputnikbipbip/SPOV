import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [PageIntroComponent],
  template: `<app-page-intro [eyebrow]="data['eyebrow']" [title]="data['title']" [text]="data['text']"><div class="legal-card"><p>{{ data['text'] }}</p></div></app-page-intro>`
})
export class LegalComponent {
  protected readonly data = inject(ActivatedRoute).snapshot.data;
}
