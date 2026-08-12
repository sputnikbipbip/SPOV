import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { HomeComponent } from './pages/home.component';
import { AboutComponent, HistoryComponent, GovernanceComponent } from './pages/institutional.component';
import { MembershipComponent } from './pages/membership.component';
import { PartnerRegistrationComponent } from './pages/partner-registration.component';
import { PartnerLoginComponent } from './pages/partner-login.component';
import { PartnerProfileComponent } from './pages/partner-profile.component';
import { DocumentsComponent } from './pages/documents.component';
import { EventsComponent } from './pages/events.component';
import { EventComponent } from './pages/event.component';
import { ContactsComponent } from './pages/contacts.component';
import { ThankYouComponent } from './pages/thank-you.component';
import { LegalComponent } from './pages/legal.component';
import { NotFoundComponent } from './pages/not-found.component';
import { AdminLoginComponent } from './pages/admin-login.component';
import { AdminEventsComponent } from './pages/admin-events.component';
import { AdminPartnersComponent } from './pages/admin-partners.component';
import { EventsService } from './services/events.service';
import { PartnerForgotPasswordComponent } from './pages/partner-forgot-password.component';
import { PartnerResetPasswordComponent } from './pages/partner-reset-password.component';
import { PartnersService } from './services/partners.service';

/** Wait for the microtask queue to drain completely after HTTP flush. */
async function microtaskTick(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 10));
}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HomeComponent], providers: [provideRouter(routes)] });
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('renders hero heading', () => {
    expect(fixture.nativeElement.textContent).toContain('Sociedade Portuguesa de Oncologia Veterinária');
  });

  it('renders CTA buttons', () => {
    expect(fixture.nativeElement.textContent).toContain('Tornar-me sócio');
    expect(fixture.nativeElement.textContent).toContain('Conhecer a SPOV');
  });
});

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AboutComponent], providers: [provideRouter(routes)] });
    fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
  });

  it('renders page title', () => {
    expect(fixture.nativeElement.textContent).toContain('A Sociedade');
  });

  it('links to history and governance pages', () => {
    const historyLink = fixture.nativeElement.querySelector('a[routerLink="/history"]') as HTMLAnchorElement;
    const governanceLink = fixture.nativeElement.querySelector('a[routerLink="/governance"]') as HTMLAnchorElement;
    expect(historyLink).not.toBeNull();
    expect(governanceLink).not.toBeNull();
  });
});

describe('HistoryComponent', () => {
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HistoryComponent] });
    fixture = TestBed.createComponent(HistoryComponent);
    fixture.detectChanges();
  });

  it('renders history title', () => {
    expect(fixture.nativeElement.textContent).toContain('História');
  });
});

describe('GovernanceComponent', () => {
  let fixture: ComponentFixture<GovernanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GovernanceComponent] });
    fixture = TestBed.createComponent(GovernanceComponent);
    fixture.detectChanges();
  });

  it('renders governance title', () => {
    expect(fixture.nativeElement.textContent).toContain('Governação');
  });
});

describe('MembershipComponent', () => {
  let fixture: ComponentFixture<MembershipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MembershipComponent], providers: [provideHttpClient(), provideRouter(routes)] });
    fixture = TestBed.createComponent(MembershipComponent);
    fixture.detectChanges();
  });

  it('renders benefits section', () => {
    expect(fixture.nativeElement.textContent).toContain('Vantagens claras');
  });

  it('renders CTA link to join', () => {
    expect(fixture.nativeElement.textContent).toContain('Aderir à SPOV');
  });
});

describe('PartnerRegistrationComponent', () => {
  let fixture: ComponentFixture<PartnerRegistrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PartnerRegistrationComponent], providers: [provideHttpClient(), provideRouter(routes)] });
    fixture = TestBed.createComponent(PartnerRegistrationComponent);
    fixture.detectChanges();
  });

  it('renders registration form', () => {
    expect(fixture.nativeElement.textContent).toContain('Aderir à SPOV');
  });

  it('shows pricing values', () => {
    expect(fixture.nativeElement.textContent).toContain('€30,00');
    expect(fixture.nativeElement.textContent).toContain('€50,00');
  });
});

describe('PartnerLoginComponent', () => {
  let fixture: ComponentFixture<PartnerLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PartnerLoginComponent], providers: [provideHttpClient(), provideRouter(routes)] });
    fixture = TestBed.createComponent(PartnerLoginComponent);
    fixture.detectChanges();
  });

  it('renders login form', () => {
    expect(fixture.nativeElement.textContent).toContain('Área Reservada');
  });

  it('renders register link', () => {
    expect(fixture.nativeElement.textContent).toContain('Aderir à SPOV');
  });
});

describe('PartnerProfileComponent', () => {
  const profileData = { id: 1, fullName: 'Maria', email: 'maria@test.com', phone: '+351900000000', partnerType: 'Professional', membershipStatus: 'Active', joinedAt: '2025-01-01', payments: [], initiationFee: 30, quotaValue: 50, totalAmount: 80 };

  function createFixture() {
    TestBed.configureTestingModule({ imports: [PartnerProfileComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)] });
    const fixture = TestBed.createComponent(PartnerProfileComponent);
    const httpMock = TestBed.inject(HttpTestingController);
    return { fixture, httpMock };
  }

  async function flushProfile(httpMock: HttpTestingController) {
    httpMock.expectOne('/api/partners/my-profile').flush(profileData);
    await microtaskTick();
    httpMock.expectOne('/api/partners/me/registrations').flush([]);
  }

  it('shows loading state initially', () => {
    const { fixture, httpMock } = createFixture();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('A carregar perfil');
    httpMock.expectOne('/api/partners/my-profile').flush(profileData);
  });

  it('renders profile after load', async () => {
    const { fixture, httpMock } = createFixture();
    fixture.detectChanges();
    await flushProfile(httpMock);
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Maria');
  });

  it('shows error state on 401', async () => {
    const { fixture, httpMock } = createFixture();
    fixture.detectChanges();
    const req = httpMock.expectOne('/api/partners/my-profile');
    req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sessão expirada');
  });

  it('shows edit button on profile', async () => {
    const { fixture, httpMock } = createFixture();
    fixture.detectChanges();
    await flushProfile(httpMock);
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Editar Perfil');
  });

  it('shows documents link on profile', async () => {
    const { fixture, httpMock } = createFixture();
    fixture.detectChanges();
    await flushProfile(httpMock);
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Documentos');
  });
});

describe('EventsComponent', () => {
  const emptyPaged = { data: [], pageNumber: 1, pageSize: 50, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false };
  const eventsPaged = {
    data: [{ id: 1, title: 'Test Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null }],
    pageNumber: 1, pageSize: 50, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false,
  };

  it('shows empty state when no events', () => {
    TestBed.configureTestingModule({ imports: [EventsComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)] });
    const fixture = TestBed.createComponent(EventsComponent);
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((req: any) => req.url.split('?')[0] === '/api/events').flush(emptyPaged);
    expect(fixture.nativeElement.textContent).toContain('Ainda não há eventos');
  });

  it('renders events after load', async () => {
    TestBed.configureTestingModule({ imports: [EventsComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)] });
    const fixture = TestBed.createComponent(EventsComponent);
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const req = httpMock.expectOne((eventReq: any) => eventReq.url.split('?')[0] === '/api/events');
    req.flush(eventsPaged);
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test Event');
  });
});

describe('EventComponent', () => {
  it('shows event hero after load', async () => {
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('My Event');
  });

  it('shows register button when logged in', async () => {
    localStorage.setItem('spov_token', 'fake-token');
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Inscrever como sócio');
    localStorage.clear();
  });

  it('shows event image in hero when present', async () => {
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: 'data:image/png;base64,abc' });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.event-hero-image') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('data:image/png;base64,abc');
  });

  it('renders event and does not redirect when registration check fails', async () => {
    localStorage.setItem('spov_token', 'fake-token');
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockRejectedValue(new Error('Unauthorized'));
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('My Event');
    expect(navigateSpy).not.toHaveBeenCalled();
    localStorage.clear();
  });

  it('shows same-day duration with times in hero meta', async () => {
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-11-22T09:00:00', endDate: '2026-11-22T17:30:00', location: null, isMembersOnly: false, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const duration = fixture.nativeElement.querySelector('.event-meta-item strong') as HTMLElement;
    expect(duration.textContent).toContain('22 NOV 2026 · 09:00 – 17:30');
  });

  it('shows multi-day duration range in hero meta', async () => {
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-11-22T09:00:00', endDate: '2026-11-24T18:00:00', location: 'Lisboa', isMembersOnly: false, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('22 NOV – 24 NOV 2026');
    expect(fixture.nativeElement.textContent).toContain('Local');
    expect(fixture.nativeElement.textContent).toContain('Lisboa');
  });

  it('labels the back link as Voltar', async () => {
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const backLink = fixture.nativeElement.querySelector('a[routerLink="/events"]') as HTMLAnchorElement;
    expect(backLink).not.toBeNull();
    expect(backLink.textContent.trim()).toBe('← Voltar');
  });

  it('navigates to /events when the Voltar link is clicked', async () => {
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const backLink = fixture.nativeElement.querySelector('a[routerLink="/events"]') as HTMLAnchorElement;
    backLink.click();
    const navigatedToEvents = navSpy.mock.calls.some((call: unknown[]) => {
      const target = call[0];
      return typeof target === 'string' ? target === '/events' : router.serializeUrl(target) === '/events';
    });
    expect(navigatedToEvents).toBe(true);
  });

  it('shows details panel with meta rows', async () => {
    TestBed.configureTestingModule({ imports: [EventComponent], providers: [provideRouter(routes), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-11-22T09:00:00', endDate: '2026-11-22T17:30:00', location: 'Lisboa', isMembersOnly: true, imageData: null });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.event-panel') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.textContent).toContain('Detalhes');
    expect(panel.textContent).toContain('22 NOV 2026 · 09:00 – 17:30');
    expect(panel.textContent).toContain('Lisboa');
    expect(panel.textContent).toContain('Exclusivo sócios');
  });
});

describe('ContactsComponent', () => {
  let fixture: ComponentFixture<ContactsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ContactsComponent], providers: [provideHttpClient(), provideRouter(routes)] });
    fixture = TestBed.createComponent(ContactsComponent);
    fixture.detectChanges();
  });

  it('renders contact form', () => {
    expect(fixture.nativeElement.textContent).toContain('Contactos');
  });

  it('shows contact info panel with email', () => {
    expect(fixture.nativeElement.textContent).toContain('geral.spov@gmail.com');
  });

  it('shows subject dropdown', () => {
    const select = fixture.nativeElement.querySelector('select');
    expect(select).not.toBeNull();
    expect(select.value).toBe('Contacto');
  });

  it('renders map section', () => {
    expect(fixture.nativeElement.textContent).toContain('Localização');
    const iframe = fixture.nativeElement.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe.title).toContain('SPOV');
  });
});

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NotFoundComponent], providers: [provideRouter(routes)] });
    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
  });

  it('renders not found message', () => {
    expect(fixture.nativeElement.textContent).toContain('Página não encontrada');
  });

  it('links back to the home page', () => {
    const link = fixture.nativeElement.querySelector('a[routerLink="/"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
  });
});

describe('ThankYouComponent', () => {
  let fixture: ComponentFixture<ThankYouComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ThankYouComponent], providers: [provideRouter(routes)] });
    fixture = TestBed.createComponent(ThankYouComponent);
    fixture.detectChanges();
  });

  it('shows success message', () => {
    expect(fixture.nativeElement.textContent).toContain('Pedido enviado com sucesso');
  });
});

describe('LegalComponent', () => {
  it('renders legal content from route data', () => {
    TestBed.configureTestingModule({
      imports: [LegalComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { eyebrow: 'Privacidade', title: 'Política de Privacidade', text: 'Saiba como tratamos os seus dados.' } } } },
      ],
    });
    const fixture = TestBed.createComponent(LegalComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Privacidade');
  });

  it('adds extra bottom spacing before the footer', () => {
    TestBed.configureTestingModule({
      imports: [LegalComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { eyebrow: 'Privacidade', title: 'Política de Privacidade', text: 'Saiba como tratamos os seus dados.' } } } },
      ],
    });
    const fixture = TestBed.createComponent(LegalComponent);
    fixture.detectChanges();
    const intro = fixture.nativeElement.querySelector('app-page-intro') as HTMLElement;
    expect(intro.classList.contains('page-intro--spaced')).toBe(true);
  });
});

describe('DocumentsComponent', () => {
  const emptyPaged = { data: [], pageNumber: 1, pageSize: 50, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false };
  const documentsPaged = {
    data: [{ id: 1, fileName: 'relatorio.pdf', filePath: '/uploads/relatorio.pdf', category: 'Relatórios', uploadDate: '2026-01-01', ownerId: null }],
    pageNumber: 1, pageSize: 50, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false,
  };

  it('shows empty state when no documents', async () => {
    TestBed.configureTestingModule({ imports: [DocumentsComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)] });
    const fixture = TestBed.createComponent(DocumentsComponent);
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((req: any) => req.url.split('?')[0] === '/api/documents').flush(emptyPaged);
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum documento disponível');
  });

  it('renders documents after load', async () => {
    TestBed.configureTestingModule({ imports: [DocumentsComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)] });
    const fixture = TestBed.createComponent(DocumentsComponent);
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const req = httpMock.expectOne((docReq: any) => docReq.url.split('?')[0] === '/api/documents');
    req.flush(documentsPaged);
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('relatorio.pdf');
  });
});

describe('PartnerForgotPasswordComponent', () => {
  let fixture: ComponentFixture<PartnerForgotPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PartnerForgotPasswordComponent], providers: [provideHttpClient(), provideRouter(routes)] });
    fixture = TestBed.createComponent(PartnerForgotPasswordComponent);
    fixture.detectChanges();
  });

  it('renders forgot password form', () => {
    expect(fixture.nativeElement.textContent).toContain('Recuperar palavra-passe');
  });

  it('shows email input field', () => {
    const input = fixture.nativeElement.querySelector('input[type="email"]');
    expect(input).not.toBeNull();
  });

  it('has link back to login', () => {
    const links = fixture.nativeElement.querySelectorAll('a[routerLink="/partners/login"]');
    expect(links.length).toBeGreaterThan(0);
  });
});

describe('PartnerResetPasswordComponent', () => {
  it('renders error when params missing', () => {
    TestBed.configureTestingModule({ imports: [PartnerResetPasswordComponent], providers: [provideHttpClient(), provideRouter(routes), { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } }] });
    const fixture = TestBed.createComponent(PartnerResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Link inválido');
  });

  it('renders form when params present', () => {
    TestBed.configureTestingModule({ imports: [PartnerResetPasswordComponent], providers: [provideHttpClient(), provideRouter(routes), { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: (key: string) => key === 'email' ? 'test@test.com' : 'code123' } } } }] });
    const fixture = TestBed.createComponent(PartnerResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Definir nova palavra-passe');
  });
});

describe('AdminLoginComponent', () => {
  let fixture: ComponentFixture<AdminLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AdminLoginComponent], providers: [provideHttpClient(), provideRouter(routes)] });
    fixture = TestBed.createComponent(AdminLoginComponent);
    fixture.detectChanges();
  });

  it('renders admin login form', () => {
    expect(fixture.nativeElement.textContent).toContain('Acesso Administrador');
  });
});

describe('AdminEventsComponent', () => {
  const emptyPaged = { data: [], pageNumber: 1, pageSize: 50, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false };
  const eventsPaged = {
    data: [{ id: 1, title: 'Admin Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null }],
    pageNumber: 1, pageSize: 50, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false,
  };

  it('shows empty state when no events', async () => {
    TestBed.configureTestingModule({ imports: [AdminEventsComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPaged);
    const fixture = TestBed.createComponent(AdminEventsComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum evento encontrado');
  });

  it('renders events list', async () => {
    TestBed.configureTestingModule({ imports: [AdminEventsComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(eventsPaged);
    const fixture = TestBed.createComponent(AdminEventsComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Admin Event');
  });

  it('renders event image thumbnail in list row', async () => {
    TestBed.configureTestingModule({ imports: [AdminEventsComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getAll').mockResolvedValue({
      data: [{ id: 1, title: 'Admin Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: 'data:image/png;base64,abc' }],
      pageNumber: 1, pageSize: 50, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false,
    });
    const fixture = TestBed.createComponent(AdminEventsComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.admin-event-thumb img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('data:image/png;base64,abc');
  });

  it('create request includes imageData', async () => {
    TestBed.configureTestingModule({ imports: [AdminEventsComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPaged);
    const createSpy = jest.spyOn(svc, 'create').mockResolvedValue({ id: 1, title: 'New Event', description: null, startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: 'data:image/png;base64,abc' });
    const fixture = TestBed.createComponent(AdminEventsComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const comp = fixture.componentInstance as any;
    comp.showNewForm = true;
    fixture.detectChanges();
    comp.newForm.patchValue({ title: 'New Event', startDate: '2026-01-01T09:00', endDate: '2026-01-01T18:00', imageData: 'data:image/png;base64,abc' });
    fixture.nativeElement.querySelector('.admin-form button[type="submit"]').click();
    await microtaskTick();
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Event', imageData: 'data:image/png;base64,abc' }));
  });

  it('opens registrations modal and renders registrations', async () => {
    TestBed.configureTestingModule({ imports: [AdminEventsComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(EventsService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(eventsPaged);
    jest.spyOn(svc, 'getRegistrations').mockResolvedValue([
      { id: 1, eventId: 1, partnerId: 9, registeredAt: '2026-01-01T10:00:00', partnerFullName: 'Maria Silva', partnerEmail: 'maria@test.com' }
    ]);
    const fixture = TestBed.createComponent(AdminEventsComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.event-row-actions button'));
    const registrationsButton = buttons.find((b: HTMLButtonElement) => b.textContent?.trim() === 'Inscrições') as HTMLButtonElement;
    registrationsButton.click();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Maria Silva');
    expect(fixture.nativeElement.textContent).toContain('maria@test.com');
  });
});

describe('AdminPartnersComponent', () => {
  const emptyPagedResponse = { data: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false };
  const singlePagedResponse = {
    data: [{ id: 1, fullName: 'John Doe', membershipStatus: 'Pending', joinedAt: '2025-06-01', userId: 'abc', clinicName: null, specialization: null, country: null, membershipTierId: null, membershipTierName: null, membershipExpiresAt: null }],
    pageNumber: 1, pageSize: 10, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false
  };
  const detailProfile = {
    id: 1, fullName: 'John Doe', email: 'john@test.com', phone: '+351900000000', taxId: null, birthDate: null,
    address: null, city: null, zipCode: null, country: null, academicQualifications: null, professionalCardNumber: null,
    profession: null, companyName: null, companyPhone: null, observations: null, paymentProofUrl: null,
    initiationFee: 30, quotaValue: 50, totalAmount: 80, partnerType: 'Professional', membershipStatus: 'Pending',
    membershipTierId: null, membershipTierName: null, joinedAt: '2025-06-01', membershipExpiresAt: null, payments: []
  };

  it('shows empty state when no partners', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum sócio encontrado');
  });

  it('renders partner list', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(singlePagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('John Doe');
  });

  it('hides pagination when totalPages is 1', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(singlePagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination')).toBeNull();
  });

  it('shows pagination when totalPages > 1', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    const pagedResponse = {
      data: [{ id: 1, fullName: 'Jane Doe', membershipStatus: 'Active', joinedAt: '2025-01-01', userId: 'u1', clinicName: null, specialization: null, country: null, membershipTierId: null, membershipTierName: null, membershipExpiresAt: null }],
      pageNumber: 1, pageSize: 10, totalPages: 3, totalRecords: 25, hasNextPage: true, hasPreviousPage: false
    };
    jest.spyOn(svc, 'getAll').mockResolvedValue(pagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('1 / 3');
  });

  it('disables previous button on first page', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    const pagedResponse = {
      data: [{ id: 1, fullName: 'Jane Doe', membershipStatus: 'Active', joinedAt: '2025-01-01', userId: 'u1', clinicName: null, specialization: null, country: null, membershipTierId: null, membershipTierName: null, membershipExpiresAt: null }],
      pageNumber: 1, pageSize: 10, totalPages: 3, totalRecords: 25, hasNextPage: true, hasPreviousPage: false
    };
    jest.spyOn(svc, 'getAll').mockResolvedValue(pagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.pagination button');
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
  });

  it('renders search box and status filter', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="search"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('select')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Todos os estados');
  });

  it('reloads with search and status when filters applied', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    const comp = fixture.componentInstance as any;
    comp.searchTerm = 'John';
    comp.statusFilter = 'Pending';
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.admin-filters button').click();
    await microtaskTick();
    expect(svc.getAll).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 9, search: 'John', membershipStatus: 'Pending' });
  });

  it('reloads when status select changes', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    const comp = fixture.componentInstance as any;
    comp.statusFilter = 'Active';
    const select = fixture.nativeElement.querySelector('select');
    select.value = 'Active';
    select.dispatchEvent(new Event('change'));
    await microtaskTick();
    expect(svc.getAll).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 9, search: undefined, membershipStatus: 'Active' });
  });

  it('opens details modal with profile info', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(singlePagedResponse);
    jest.spyOn(svc, 'getById').mockResolvedValue(detailProfile);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const detailsButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b: HTMLButtonElement) => b.textContent?.trim() === 'Ver detalhes');
    (detailsButton as HTMLButtonElement).click();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('john@test.com');
    expect(fixture.nativeElement.textContent).toContain('+351900000000');
  });

  it('closes details modal', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(singlePagedResponse);
    jest.spyOn(svc, 'getById').mockResolvedValue(detailProfile);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const detailsButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b: HTMLButtonElement) => b.textContent?.trim() === 'Ver detalhes');
    (detailsButton as HTMLButtonElement).click();
    await microtaskTick();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.modal-close').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal')).toBeNull();
  });

  function partnerRowWithExpiry(membershipExpiresAt: string | null) {
    return {
      id: 1, fullName: 'Jane Doe', membershipStatus: 'Active', joinedAt: '2025-01-01', userId: 'u1',
      clinicName: null, specialization: null, country: null, membershipTierId: null, membershipTierName: null,
      membershipExpiresAt
    };
  }

  function daysFromNow(days: number): string {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  async function renderPartnerRow(membershipExpiresAt: string | null) {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue({
      data: [partnerRowWithExpiry(membershipExpiresAt)],
      pageNumber: 1, pageSize: 10, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false
    });
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    return fixture;
  }

  it('shows subscription expiration date in list row', async () => {
    const fixture = await renderPartnerRow(daysFromNow(10));
    expect(fixture.nativeElement.textContent).toContain('Expira em');
    expect(fixture.nativeElement.textContent).toContain('Jane Doe');
  });

  it('shows placeholder when no expiration date', async () => {
    const fixture = await renderPartnerRow(null);
    expect(fixture.nativeElement.textContent).toContain('Expira em —');
  });

  it('marks expired subscription in red', async () => {
    const fixture = await renderPartnerRow(daysFromNow(-10));
    expect(fixture.nativeElement.querySelector('.event-row-dates .text-danger')).not.toBeNull();
  });

  it('marks expiring soon subscription in amber', async () => {
    const fixture = await renderPartnerRow(daysFromNow(10));
    expect(fixture.nativeElement.querySelector('.event-row-dates .text-warning')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.event-row-dates .text-danger')).toBeNull();
  });

  it('leaves long-dated subscription neutral', async () => {
    const fixture = await renderPartnerRow(daysFromNow(90));
    expect(fixture.nativeElement.querySelector('.event-row-dates .text-danger')).toBeNull();
    expect(fixture.nativeElement.querySelector('.event-row-dates .text-warning')).toBeNull();
  });

  it('renders a Novo Sócio button', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b: HTMLButtonElement) => b.textContent?.trim() === 'Novo Sócio');
    expect(button).not.toBeNull();
  });

  it('opens create modal when Novo Sócio is clicked', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b: HTMLButtonElement) => b.textContent?.trim() === 'Novo Sócio') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal')).not.toBeNull();
  });

  it('submits createPartner and shows the temporary password', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const createSpy = jest.spyOn(svc, 'createPartner').mockResolvedValue({
      partner: { id: 1, fullName: 'Miguel Almeida', email: 'miguel@spov.pt', phone: '+351900000111', partnerType: 'Professional', membershipStatus: 'Active', payments: [], initiationFee: 30, quotaValue: 50, totalAmount: 80 },
      temporaryPassword: 'Spov2026!'
    });
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const comp = fixture.componentInstance as any;
    comp.showCreate = true;
    fixture.detectChanges();
    comp.newPartner.patchValue({
      fullName: 'Miguel Almeida',
      email: 'miguel@spov.pt',
      phone: '+351900000111',
      partnerType: 'Professional',
      joinedAt: '2024-03-01'
    });
    fixture.nativeElement.querySelector('.modal form button[type="submit"]').click();
    await microtaskTick();
    fixture.detectChanges();
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'Miguel Almeida',
      email: 'miguel@spov.pt',
      phone: '+351900000111',
      partnerType: 'Professional',
      initiationFee: 30,
      quotaValue: 50,
      totalAmount: 80
    }));
    expect(fixture.nativeElement.textContent).toContain('Spov2026!');
  });

  it('shows error when createPartner fails', async () => {
    TestBed.configureTestingModule({ imports: [AdminPartnersComponent], providers: [provideHttpClient()] });
    const svc = TestBed.inject(PartnersService);
    jest.spyOn(svc, 'getAll').mockResolvedValue(emptyPagedResponse);
    const rejection = Promise.reject(new Error('Já existe um sócio registado com este email.'));
    rejection.catch(() => {});
    jest.spyOn(svc, 'createPartner').mockReturnValue(rejection);
    const fixture = TestBed.createComponent(AdminPartnersComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    const comp = fixture.componentInstance as any;
    comp.showCreate = true;
    fixture.detectChanges();
    comp.newPartner.patchValue({
      fullName: 'Miguel Almeida',
      email: 'miguel@spov.pt',
      phone: '+351900000111',
      partnerType: 'Professional',
      joinedAt: '2024-03-01'
    });
    fixture.nativeElement.querySelector('.modal form button[type="submit"]').click();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Já existe um sócio registado com este email.');
  });
});
