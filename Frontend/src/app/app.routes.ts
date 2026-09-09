import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PartnerAuthGuard } from './guards/partner-auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent), title: 'SPOV - Sociedade Portuguesa de Oncologia Veterinária' },
  { path: 'about', loadComponent: () => import('./pages/institutional.component').then(m => m.AboutComponent), title: 'A Sociedade - SPOV' },
  { path: 'history', loadComponent: () => import('./pages/institutional.component').then(m => m.HistoryComponent), title: 'História - SPOV' },
  { path: 'governance', loadComponent: () => import('./pages/institutional.component').then(m => m.GovernanceComponent), title: 'Governação - SPOV' },
  { path: 'partners', loadComponent: () => import('./pages/membership.component').then(m => m.MembershipComponent), title: 'Sócios - SPOV' },
  { path: 'partners/join', loadComponent: () => import('./pages/partner-registration.component').then(m => m.PartnerRegistrationComponent), title: 'Aderir à SPOV - Sócios' },
  { path: 'partners/login', loadComponent: () => import('./pages/partner-login.component').then(m => m.PartnerLoginComponent), title: 'Iniciar Sessão - Sócios' },
  { path: 'partners/forgot-password', loadComponent: () => import('./pages/partner-forgot-password.component').then(m => m.PartnerForgotPasswordComponent), title: 'Recuperar Palavra-passe - Sócios' },
  { path: 'partners/reset-password', loadComponent: () => import('./pages/partner-reset-password.component').then(m => m.PartnerResetPasswordComponent), title: 'Redefinir Palavra-passe - Sócios' },
  { path: 'partners/profile', loadComponent: () => import('./pages/partner-profile.component').then(m => m.PartnerProfileComponent), canActivate: [PartnerAuthGuard], title: 'O meu perfil - Sócios' },
  { path: 'documents', loadComponent: () => import('./pages/documents.component').then(m => m.DocumentsComponent), canActivate: [PartnerAuthGuard], title: 'Documentos - SPOV' },
  { path: 'events', loadComponent: () => import('./pages/events.component').then(m => m.EventsComponent), title: 'Eventos - SPOV' },
  { path: 'events/:id', loadComponent: () => import('./pages/event.component').then(m => m.EventComponent), title: 'Evento - SPOV' },
  { path: 'contacts', loadComponent: () => import('./pages/contacts.component').then(m => m.ContactsComponent), title: 'Contactos - SPOV' },
  { path: 'thank-you', loadComponent: () => import('./pages/thank-you.component').then(m => m.ThankYouComponent), title: 'Pedido enviado - SPOV' },
  { path: 'privacy', loadComponent: () => import('./pages/legal.component').then(m => m.LegalComponent), title: 'Privacidade - SPOV', data: { eyebrow: 'Privacidade', title: 'Privacidade com uma base clara e institucional.', text: 'A SPOV recolhe apenas o essencial, com transparência e consentimento claro.' } },
  { path: 'cookies', loadComponent: () => import('./pages/legal.component').then(m => m.LegalComponent), title: 'Cookies - SPOV', data: { eyebrow: 'Cookies', title: 'Uso de cookies explicado de forma simples.', text: 'A SPOV utiliza apenas cookies técnicos e essenciais ao funcionamento do website.' } },
  { path: 'accessibility', loadComponent: () => import('./pages/legal.component').then(m => m.LegalComponent), title: 'Acessibilidade - SPOV', data: { eyebrow: 'Acessibilidade', title: 'Compromisso com um website acessível e utilizável.', text: 'A SPOV está empenhada em tornar o seu website acessível a todos os utilizadores.' } },
  { path: 'admin/login', loadComponent: () => import('./pages/admin-login.component').then(m => m.AdminLoginComponent), title: 'Admin Login - SPOV' },
  { path: 'admin', loadComponent: () => import('./admin-layout.component').then(m => m.AdminLayoutComponent), canActivate: [AuthGuard], children: [
    { path: '', redirectTo: 'events', pathMatch: 'full' },
    { path: 'events', loadComponent: () => import('./pages/admin-events.component').then(m => m.AdminEventsComponent), title: 'Gerir Eventos - SPOV Admin' },
    { path: 'partners', loadComponent: () => import('./pages/admin-partners.component').then(m => m.AdminPartnersComponent), title: 'Gerir Sócios - SPOV Admin' }
  ] },
  { path: '**', loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent), title: 'Página não encontrada - SPOV' }
];
