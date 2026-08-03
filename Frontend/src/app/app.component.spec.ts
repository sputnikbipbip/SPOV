import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await router.navigateByUrl('/');
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('renders header and footer on public pages', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).not.toBeNull();
    expect(el.querySelector('app-footer')).not.toBeNull();
  });

  it('hides header and footer on admin dashboard', async () => {
    localStorage.setItem('spov_token', 'fake-token');
    const nav = router.navigateByUrl('/admin/events');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const req = httpMock.expectOne('/api/me');
    req.flush({ id: '1', email: 'admin@spov.pt', roles: ['Administrator'] });
    await nav;
    fixture.detectChanges();
    httpMock.expectOne('/api/events').flush([]);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).toBeNull();
    expect(el.querySelector('app-footer')).toBeNull();
    expect(el.querySelector('app-admin-layout')).not.toBeNull();
    localStorage.clear();
  });

  it('hides header and footer on admin login', async () => {
    await router.navigateByUrl('/admin/login');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).toBeNull();
    expect(el.querySelector('app-footer')).toBeNull();
  });
});
