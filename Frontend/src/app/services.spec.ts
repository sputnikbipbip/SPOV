import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './services/auth.service';
import { PartnersService, RegisterPartnerRequest, CreatePartnerRequest } from './services/partners.service';
import { EventsService, CreateEventRequest, UpdateEventRequest } from './services/events.service';
import { ContactsService, CreateContactRequest } from './services/contacts.service';
import { DocumentsService } from './services/documents.service';
import { ApiService } from './services/api.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('stores token on successful login', async () => {
    const loginPromise = service.login('test@spov.pt', 'password');
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@spov.pt', password: 'password' });
    req.flush({ accessToken: 'token-123', tokenType: 'Bearer', expiresIn: 3600 });
    await loginPromise;
    expect(localStorage.getItem('spov_token')).toBe('token-123');
  });

  it('clears token on logout', () => {
    localStorage.setItem('spov_token', 'token-123');
    service.logout();
    expect(localStorage.getItem('spov_token')).toBeNull();
  });

  it('isAuthenticated returns true when token exists', () => {
    localStorage.setItem('spov_token', 'token-123');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated returns false when no token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('getCurrentUser returns user with auth header', async () => {
    localStorage.setItem('spov_token', 'token-123');
    const promise = service.getCurrentUser();
    const req = httpMock.expectOne('/api/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({ id: '1', email: 'admin@spov.pt', roles: ['Administrator'] });
    const result = await promise;
    expect(result).toEqual({ id: '1', email: 'admin@spov.pt', roles: ['Administrator'] });
  });

  it('getCurrentUser returns null when no token', async () => {
    const result = await service.getCurrentUser();
    expect(result).toBeNull();
  });

  it('getCurrentUser returns null on error', async () => {
    localStorage.setItem('spov_token', 'token-123');
    const promise = service.getCurrentUser();
    httpMock.expectOne('/api/me').flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    const result = await promise;
    expect(result).toBeNull();
  });
});

describe('PartnersService', () => {
  let service: PartnersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PartnersService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('register sends POST to /api/partners/register', async () => {
    const data: RegisterPartnerRequest = {
      fullName: 'John Doe', email: 'john@test.com', password: 'pass123', phone: '+351900000000',
      partnerType: 'Professional', initiationFee: 30, quotaValue: 50, totalAmount: 80,
    };
    const promise = service.register(data);
    const req = httpMock.expectOne('/api/partners/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 1, fullName: 'John Doe', email: 'john@test.com', phone: '+351900000000', partnerType: 'Professional', membershipStatus: 'Pending', payments: [], initiationFee: 30, quotaValue: 50, totalAmount: 80 });
    const result = await promise;
    expect(result.id).toBe(1);
  });

  it('getAll sends GET to /api/partners', async () => {
    const promise = service.getAll();
    const req = httpMock.expectOne('/api/partners');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false });
    const result = await promise;
    expect(result.data).toEqual([]);
  });

  it('createPartner sends POST to /api/partners', async () => {
    const data: CreatePartnerRequest = {
      fullName: 'Miguel Almeida', email: 'miguel@spov.pt', phone: '+351900000111', partnerType: 'Professional',
      joinedAt: '2024-03-01', initiationFee: 30, quotaValue: 50, totalAmount: 80,
    };
    const promise = service.createPartner(data);
    const req = httpMock.expectOne('/api/partners');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ partner: { id: 1, fullName: 'Miguel Almeida', email: 'miguel@spov.pt', phone: '+351900000111', partnerType: 'Professional', membershipStatus: 'Active', payments: [], initiationFee: 30, quotaValue: 50, totalAmount: 80 }, temporaryPassword: 'Spov2026!' });
    const result = await promise;
    expect(result.partner.id).toBe(1);
    expect(result.partner.membershipStatus).toBe('Active');
    expect(result.temporaryPassword).toBe('Spov2026!');
  });

  it('getAll forwards MembershipStatus param', async () => {
    const promise = service.getAll({ membershipStatus: 'Pending' });
    const req = httpMock.expectOne((r: any) => r.url.startsWith('/api/partners'));
    expect(req.request.params.get('MembershipStatus')).toBe('Pending');
    req.flush({ data: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false });
    await promise;
  });

  it('getById sends GET to /api/partners/{id}/profile', async () => {
    const promise = service.getById(3);
    const req = httpMock.expectOne('/api/partners/3/profile');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 3, fullName: 'John Doe', email: 'john@test.com', phone: '+351900000000', partnerType: 'Professional', membershipStatus: 'Active', initiationFee: 30, quotaValue: 50, totalAmount: 80, payments: [] });
    const result = await promise;
    expect(result.id).toBe(3);
    expect(result.email).toBe('john@test.com');
  });

  it('approve sends POST to /api/partners/{id}/approve', async () => {
    const promise = service.approve(5);
    const req = httpMock.expectOne('/api/partners/5/approve');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 5, fullName: 'Test', membershipStatus: 'Active' });
    const result = await promise;
    expect(result.id).toBe(5);
  });

  it('getMyProfile sends GET to /api/partners/my-profile', async () => {
    const promise = service.getMyProfile();
    const req = httpMock.expectOne('/api/partners/my-profile');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, fullName: 'Test', email: 'test@test.com', payments: [] });
    const result = await promise;
    expect(result.fullName).toBe('Test');
  });

  it('updateProfile sends PUT to /api/partners/me', async () => {
    const data = { fullName: 'Updated', phone: '+351900000001' };
    const promise = service.updateProfile(data);
    const req = httpMock.expectOne('/api/partners/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 1, fullName: 'Updated', phone: '+351900000001', email: 'test@test.com', partnerType: 'Professional', membershipStatus: 'Active', payments: [], initiationFee: 30, quotaValue: 50, totalAmount: 80 });
    const result = await promise;
    expect(result.fullName).toBe('Updated');
  });

  it('uploadProof sends multipart data to the authenticated partner endpoint', async () => {
    const file = new File(['%PDF-1.7'], 'proof.pdf', { type: 'application/pdf' });
    const promise = service.uploadProof(file);
    const req = httpMock.expectOne('/api/partners/me/payment-proof');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({ id: 8, partnerId: 1, amount: 80, currency: 'EUR', status: 'Submitted', provider: 'BankTransfer', createdAt: '2026-01-01' });
    const result = await promise;
    expect(result.status).toBe('Submitted');
  });

  it('downloadPaymentProof sends an authenticated blob request', async () => {
    const promise = service.downloadPaymentProof(4, 8);
    const req = httpMock.expectOne('/api/partners/4/payments/8/proof');
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['proof'], { type: 'application/pdf' }));
    const result = await promise;
    expect(result.type).toBe('application/pdf');
  });

  it('verifyPayment and rejectPayment send the admin review actions', async () => {
    const verifyPromise = service.verifyPayment(4, 8);
    const verifyRequest = httpMock.expectOne('/api/partners/4/payments/8/verify');
    expect(verifyRequest.request.method).toBe('POST');
    verifyRequest.flush(null);
    await verifyPromise;

    const rejectPromise = service.rejectPayment(4, 8, 'Ficheiro ilegível.');
    const rejectRequest = httpMock.expectOne('/api/partners/4/payments/8/reject');
    expect(rejectRequest.request.method).toBe('POST');
    expect(rejectRequest.request.body).toEqual({ note: 'Ficheiro ilegível.' });
    rejectRequest.flush(null);
    await rejectPromise;
  });

  it('forgotPassword sends POST to /api/auth/forgotPassword', async () => {
    const promise = service.forgotPassword('test@spov.pt');
    const req = httpMock.expectOne('/api/auth/forgotPassword');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@spov.pt' });
    req.flush(null);
    await promise;
  });

  it('resetPassword sends POST to /api/auth/resetPassword', async () => {
    const promise = service.resetPassword('test@spov.pt', 'code123', 'NewPass123!');
    const req = httpMock.expectOne('/api/auth/resetPassword');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@spov.pt', resetCode: 'code123', newPassword: 'NewPass123!' });
    req.flush(null);
    await promise;
  });
});

describe('EventsService', () => {
  let service: EventsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventsService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('getAll sends GET to /api/events', async () => {
    const promise = service.getAll();
    const req = httpMock.expectOne('/api/events');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false });
    const result = await promise;
    expect(result.data).toEqual([]);
  });

  it('getAll forwards paging params', async () => {
    const promise = service.getAll({ pageNumber: 2, pageSize: 25, search: 'webinar', sortBy: 'title desc' });
    const req = httpMock.expectOne((r: any) => r.url.startsWith('/api/events'));
    expect(req.request.params.get('PageNumber')).toBe('2');
    expect(req.request.params.get('PageSize')).toBe('25');
    expect(req.request.params.get('Search')).toBe('webinar');
    expect(req.request.params.get('SortBy')).toBe('title desc');
    req.flush({ data: [], pageNumber: 2, pageSize: 25, totalPages: 0, totalRecords: 0, hasNextPage: false, hasPreviousPage: false });
    await promise;
  });

  it('getById sends GET to /api/events/{id}', async () => {
    const promise = service.getById(3);
    const req = httpMock.expectOne('/api/events/3');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 3, title: 'Event' });
    const result = await promise;
    expect(result.title).toBe('Event');
  });

  it('create sends POST to /api/events', async () => {
    const data: CreateEventRequest = { title: 'New', description: null, startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null };
    const promise = service.create(data);
    const req = httpMock.expectOne('/api/events');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, ...data });
    await promise;
  });

  it('create sends imageData in body', async () => {
    const data: CreateEventRequest = { title: 'New', description: null, startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: 'data:image/png;base64,abc' };
    const promise = service.create(data);
    const req = httpMock.expectOne('/api/events');
    expect(req.request.body).toMatchObject({ imageData: data.imageData });
    req.flush({ id: 1, ...data });
    await promise;
  });

  it('update sends PUT to /api/events/{id}', async () => {
    const data: UpdateEventRequest = { title: 'Updated', description: null, startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: null };
    const promise = service.update(1, data);
    const req = httpMock.expectOne('/api/events/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, ...data });
    await promise;
  });

  it('update sends imageData in body', async () => {
    const data: UpdateEventRequest = { title: 'Updated', description: null, startDate: '2026-01-01', endDate: '2026-01-02', location: null, isMembersOnly: false, imageData: 'data:image/jpeg;base64,xyz' };
    const promise = service.update(1, data);
    const req = httpMock.expectOne('/api/events/1');
    expect(req.request.body).toMatchObject({ imageData: data.imageData });
    req.flush({ id: 1, ...data });
    await promise;
  });

  it('delete sends DELETE to /api/events/{id}', async () => {
    const promise = service.delete(1);
    const req = httpMock.expectOne('/api/events/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await promise;
  });

  it('registerForEvent sends POST to /api/events/{id}/registrations', async () => {
    const promise = service.registerForEvent(5);
    const req = httpMock.expectOne('/api/events/5/registrations');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, eventId: 5, partnerId: 1, registeredAt: new Date().toISOString(), eventTitle: 'Test Event', eventStartDate: '2026-01-01', eventEndDate: '2026-01-02' });
    const result = await promise;
    expect(result.eventTitle).toBe('Test Event');
  });

  it('getMyRegistrations sends GET to /api/partners/me/registrations', async () => {
    const promise = service.getMyRegistrations();
    const req = httpMock.expectOne('/api/partners/me/registrations');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, eventId: 5, registeredAt: '2026-01-01', eventTitle: 'Test Event', eventStartDate: '2026-01-01', eventEndDate: '2026-01-02' }]);
    const result = await promise;
    expect(result.length).toBe(1);
    expect(result[0].eventTitle).toBe('Test Event');
  });

  it('getRegistrations sends GET to /api/events/{id}/registrations', async () => {
    const promise = service.getRegistrations(4);
    const req = httpMock.expectOne('/api/events/4/registrations');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, eventId: 4, partnerId: 9, registeredAt: '2026-01-01', partnerFullName: 'Maria Silva', partnerEmail: 'maria@test.com' }]);
    const result = await promise;
    expect(result.length).toBe(1);
    expect(result[0].partnerFullName).toBe('Maria Silva');
  });
});

describe('ContactsService', () => {
  let service: ContactsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactsService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('send posts to /api/contacts', async () => {
    const data: CreateContactRequest = { name: 'John', email: 'john@test.com', subject: 'Hello', message: 'Test' };
    const promise = service.send(data);
    const req = httpMock.expectOne('/api/contacts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 1, ...data, createdAt: new Date().toISOString() });
    const result = await promise;
    expect(result.name).toBe('John');
  });
});

describe('DocumentsService', () => {
  let service: DocumentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DocumentsService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('getAll sends GET to /api/documents', async () => {
    const promise = service.getAll();
    const req = httpMock.expectOne('/api/documents');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [{ id: 1, fileName: 'test.pdf', filePath: '/uploads/test.pdf', category: null, uploadDate: '2026-01-01', ownerId: null }], pageNumber: 1, pageSize: 10, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false });
    const result = await promise;
    expect(result.data.length).toBe(1);
    expect(result.data[0].fileName).toBe('test.pdf');
  });
});

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('includes auth header when token present', async () => {
    localStorage.setItem('spov_token', 'my-token');
    const promise = (service as any).get('/test');
    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
    await promise;
  });

  it('throws error on HTTP error', async () => {
    const promise = (service as any).get('/error');
    const req = httpMock.expectOne('/error');
    req.flush({ error: 'Not found' }, { status: 404, statusText: 'Not Found' });
    await expect(promise).rejects.toThrow('Not found');
  });
});
