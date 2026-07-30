import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

describe('App Routes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient()],
    });
    router = TestBed.inject(Router);
  });

  it('navigates to /', async () => {
    const route = await router.navigateByUrl('/');
    expect(route).toBe(true);
  });

  it('navigates to /about', async () => {
    const route = await router.navigateByUrl('/about');
    expect(route).toBe(true);
  });

  it('navigates to /partners/login', async () => {
    const route = await router.navigateByUrl('/partners/login');
    expect(route).toBe(true);
  });

  it('navigates to /partners/forgot-password', async () => {
    const route = await router.navigateByUrl('/partners/forgot-password');
    expect(route).toBe(true);
  });

  it('navigates to /partners/reset-password', async () => {
    const route = await router.navigateByUrl('/partners/reset-password');
    expect(route).toBe(true);
  });

  it('has title metadata on all top-level routes', () => {
    for (const r of routes) {
      if (r.path && r.path !== 'admin' && r.path !== '**') {
        expect(r.title).toBeTruthy();
      }
    }
  });

  it('redirects unknown paths to /', async () => {
    const route = await router.navigateByUrl('/nonexistent');
    expect(route).toBe(true);
    expect(router.url).toBe('/');
  });
});
