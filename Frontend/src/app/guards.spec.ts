import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PartnerAuthGuard } from './guards/partner-auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), AuthGuard],
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('allows access when user has Administrator role', async () => {
    localStorage.setItem('spov_token', 'fake-token');
    const result = guard.canActivate();
    const req = httpMock.expectOne('/api/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({ id: '1', email: 'admin@spov.pt', roles: ['Administrator'] });
    expect(await result).toBe(true);
  });

  it('redirects to /admin/login when user lacks Administrator role', async () => {
    localStorage.setItem('spov_token', 'fake-token');
    const result = guard.canActivate();
    httpMock.expectOne('/api/me').flush({ id: '2', email: 'partner@spov.pt', roles: ['Partner'] });
    const tree = router.parseUrl('/admin/login');
    expect(await result).toEqual(tree);
  });

  it('redirects to /admin/login when not authenticated', async () => {
    const result = guard.canActivate();
    const tree = router.parseUrl('/admin/login');
    expect(await result).toEqual(tree);
  });

  it('redirects to /admin/login when /api/me fails', async () => {
    localStorage.setItem('spov_token', 'fake-token');
    const result = guard.canActivate();
    httpMock.expectOne('/api/me').flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    const tree = router.parseUrl('/admin/login');
    expect(await result).toEqual(tree);
  });
});

describe('PartnerAuthGuard', () => {
  let guard: PartnerAuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), PartnerAuthGuard],
    });
    guard = TestBed.inject(PartnerAuthGuard);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('allows access when authenticated', () => {
    localStorage.setItem('spov_token', 'fake-token');
    expect(guard.canActivate()).toBe(true);
  });

  it('redirects to /partners/login when not authenticated', () => {
    const tree = router.parseUrl('/partners/login');
    expect(guard.canActivate()).toEqual(tree);
  });
});
