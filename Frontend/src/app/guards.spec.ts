import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PartnerAuthGuard } from './guards/partner-auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), AuthGuard],
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('allows access when authenticated', () => {
    localStorage.setItem('spov_token', 'fake-token');
    expect(guard.canActivate()).toBe(true);
  });

  it('redirects to /admin/login when not authenticated', () => {
    const tree = router.parseUrl('/admin/login');
    expect(guard.canActivate()).toEqual(tree);
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
