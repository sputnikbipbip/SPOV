import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { AboutComponent, GovernanceComponent, HistoryComponent } from './pages/institutional.component';
import { MembershipComponent } from './pages/membership.component';
import { EventsComponent } from './pages/events.component';
import { EventComponent } from './pages/event.component';
import { ContactsComponent } from './pages/contacts.component';
import { LegalComponent } from './pages/legal.component';
import { ThankYouComponent } from './pages/thank-you.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'SPOV - Sociedade Portuguesa de Oncologia Veterinária' },
  { path: 'sobre', component: AboutComponent, title: 'A Sociedade - SPOV' },
  { path: 'historia', component: HistoryComponent, title: 'História - SPOV' },
  { path: 'governacao', component: GovernanceComponent, title: 'Governação - SPOV' },
  { path: 'socios', component: MembershipComponent, title: 'Sócios - SPOV' },
  { path: 'eventos', component: EventsComponent, title: 'Eventos - SPOV' },
  { path: 'eventos/:id', component: EventComponent, title: 'Evento - SPOV' },
  { path: 'contactos', component: ContactsComponent, title: 'Contactos - SPOV' },
  { path: 'obrigado', component: ThankYouComponent, title: 'Pedido enviado - SPOV' },
  { path: 'privacidade', component: LegalComponent, data: { eyebrow: 'Privacidade', title: 'Privacidade com uma base clara e institucional.', text: 'A SPOV deve recolher apenas o essencial, com transparência e consentimento claro.' } },
  { path: 'cookies', component: LegalComponent, data: { eyebrow: 'Cookies', title: 'Uso de cookies explicado de forma simples.', text: 'A informação deve ser curta, acessível e coerente com o restante website.' } },
  { path: 'acessibilidade', component: LegalComponent, data: { eyebrow: 'Acessibilidade', title: 'Compromisso com um website claro e utilizável.', text: 'Contraste, foco visível, estrutura consistente e respeito por reduced motion desde o MVP.' } },
  { path: '**', redirectTo: '' }
];
