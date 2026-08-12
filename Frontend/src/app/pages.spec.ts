import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
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
    data: [{ id: 1, title: 'Test Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, ceCredits: null, isMembersOnly: false }],
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
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, ceCredits: null, isMembersOnly: false });
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
    jest.spyOn(svc, 'getById').mockResolvedValue({ id: 1, title: 'My Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, ceCredits: null, isMembersOnly: false });
    jest.spyOn(svc, 'getMyRegistrations').mockResolvedValue([]);
    const fixture = TestBed.createComponent(EventComponent);
    fixture.detectChanges();
    await microtaskTick();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Inscrever como sócio');
    localStorage.clear();
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
    data: [{ id: 1, title: 'Admin Event', description: 'Desc', startDate: '2026-01-01', endDate: '2026-01-02', location: null, ceCredits: null, isMembersOnly: false }],
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
    expect(svc.getAll).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 10, search: 'John', membershipStatus: 'Pending' });
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
    expect(svc.getAll).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 10, search: undefined, membershipStatus: 'Active' });
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
});
