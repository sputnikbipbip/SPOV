import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { AboutComponent, GovernanceComponent, HistoryComponent } from './pages/institutional.component';
import { MembershipComponent } from './pages/membership.component';
import { PartnerRegistrationComponent } from './pages/partner-registration.component';
import { PartnerLoginComponent } from './pages/partner-login.component';
import { PartnerProfileComponent } from './pages/partner-profile.component';
import { PartnerForgotPasswordComponent } from './pages/partner-forgot-password.component';
import { PartnerResetPasswordComponent } from './pages/partner-reset-password.component';
import { DocumentsComponent } from './pages/documents.component';
import { EventsComponent } from './pages/events.component';
import { EventComponent } from './pages/event.component';
import { ContactsComponent } from './pages/contacts.component';
import { LegalComponent } from './pages/legal.component';
import { ThankYouComponent } from './pages/thank-you.component';
import { NotFoundComponent } from './pages/not-found.component';
import { AdminLoginComponent } from './pages/admin-login.component';
import { AdminEventsComponent } from './pages/admin-events.component';
import { AdminPartnersComponent } from './pages/admin-partners.component';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { PartnerAuthGuard } from './guards/partner-auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'SPOV - Sociedade Portuguesa de Oncologia Veterinária' },
  { path: 'about', component: AboutComponent, title: 'A Sociedade - SPOV' },
  { path: 'history', component: HistoryComponent, title: 'História - SPOV' },
  { path: 'governance', component: GovernanceComponent, title: 'Governação - SPOV' },
  { path: 'partners', component: MembershipComponent, title: 'Sócios - SPOV' },
  { path: 'partners/join', component: PartnerRegistrationComponent, title: 'Aderir à SPOV - Sócios' },
  { path: 'partners/login', component: PartnerLoginComponent, title: 'Iniciar Sessão - Sócios' },
  { path: 'partners/forgot-password', component: PartnerForgotPasswordComponent, title: 'Recuperar Palavra-passe - Sócios' },
  { path: 'partners/reset-password', component: PartnerResetPasswordComponent, title: 'Redefinir Palavra-passe - Sócios' },
  { path: 'partners/profile', component: PartnerProfileComponent, canActivate: [PartnerAuthGuard], title: 'O meu perfil - Sócios' },
  { path: 'documents', component: DocumentsComponent, canActivate: [PartnerAuthGuard], title: 'Documentos - SPOV' },
  { path: 'events', component: EventsComponent, title: 'Eventos - SPOV' },
  { path: 'events/:id', component: EventComponent, title: 'Evento - SPOV' },
  { path: 'contacts', component: ContactsComponent, title: 'Contactos - SPOV' },
  { path: 'thank-you', component: ThankYouComponent, title: 'Pedido enviado - SPOV' },
  { path: 'privacy', component: LegalComponent, title: 'Privacidade - SPOV', data: { eyebrow: 'Privacidade', title: 'Privacidade com uma base clara e institucional.', text: 'A SPOV recolhe apenas o essencial, com transparência e consentimento claro.' } },
  { path: 'cookies', component: LegalComponent, title: 'Cookies - SPOV', data: { eyebrow: 'Cookies', title: 'Uso de cookies explicado de forma simples.', text: 'A SPOV utiliza apenas cookies técnicos e essenciais ao funcionamento do website.' } },
  { path: 'accessibility', component: LegalComponent, title: 'Acessibilidade - SPOV', data: { eyebrow: 'Acessibilidade', title: 'Compromisso com um website acessível e utilizável.', text: 'A SPOV está empenhada em tornar o seu website acessível a todos os utilizadores.' } },
  { path: 'admin/login', component: AdminLoginComponent, title: 'Admin Login - SPOV' },
  { path: 'admin', component: AdminLayoutComponent, canActivate: [AuthGuard], children: [
    { path: '', redirectTo: 'events', pathMatch: 'full' },
    { path: 'events', component: AdminEventsComponent, title: 'Gerir Eventos - SPOV Admin' },
    { path: 'partners', component: AdminPartnersComponent, title: 'Gerir Sócios - SPOV Admin' }
  ] },
  { path: '**', component: NotFoundComponent, title: 'Página não encontrada - SPOV' }
];
