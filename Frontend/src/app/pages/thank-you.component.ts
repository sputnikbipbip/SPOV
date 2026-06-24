import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [RouterLink, PageIntroComponent],
  template: `<app-page-intro eyebrow="Obrigado" title="Pedido enviado com sucesso." text="A SPOV recebeu o seu pedido e deverá responder assim que possível."><a routerLink="/" class="button button-primary">Voltar ao início</a></app-page-intro>`
})
export class ThankYouComponent {}
