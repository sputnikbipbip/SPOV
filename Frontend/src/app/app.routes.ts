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
  { path: 'privacidade', component: LegalComponent, title: 'Privacidade - SPOV', data: { eyebrow: 'Privacidade', title: 'Privacidade com uma base clara e institucional.', text: 'A SPOV recolhe apenas o essencial, com transparência e consentimento claro.' } },
  { path: 'cookies', component: LegalComponent, title: 'Cookies - SPOV', data: { eyebrow: 'Cookies', title: 'Uso de cookies explicado de forma simples.', text: 'A SPOV utiliza apenas cookies técnicos e essenciais ao funcionamento do website.' } },
  { path: 'acessibilidade', component: LegalComponent, title: 'Acessibilidade - SPOV', data: { eyebrow: 'Acessibilidade', title: 'Compromisso com um website acessível e utilizável.', text: 'A SPOV está empenhada em tornar o seu website acessível a todos os utilizadores.' } },
  { path: '**', redirectTo: '' }
];
