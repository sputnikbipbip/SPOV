import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LogoComponent, FooterComponent, PageIntroComponent, EventMetaComponent, HeaderComponent } from './shared.components';
import { provideRouter } from '@angular/router';

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LogoComponent] });
    fixture = TestBed.createComponent(LogoComponent);
    fixture.detectChanges();
  });

  it('renders SPOV text', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SPOV');
    expect(el.textContent).toContain('Oncologia Veterinária');
  });
});

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FooterComponent], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('renders brand and legal links', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sociedade Portuguesa de Oncologia Veterinária');
    expect(el.textContent).toContain('Privacidade');
    expect(el.textContent).toContain('Cookies');
    expect(el.textContent).toContain('Acessibilidade');
  });

  it('has Instagram and email contact links', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const hrefs = links.map(l => l.nativeElement.getAttribute('href'));
    expect(hrefs).toContain('https://www.instagram.com/sponcovet/');
    expect(hrefs).toContain('mailto:geral.spov@gmail.com');
  });

  it('self-closing tag renders without ng-content issues', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('footer')).toBeTruthy();
  });
});

describe('PageIntroComponent', () => {
  let fixture: ComponentFixture<PageIntroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PageIntroComponent] });
    fixture = TestBed.createComponent(PageIntroComponent);
  });

  it('renders eyebrow, title, and text inputs', () => {
    fixture.componentRef.setInput('eyebrow', 'Test');
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('text', 'Test description.');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Test');
    expect(el.textContent).toContain('Test Title');
    expect(el.textContent).toContain('Test description.');
  });

  it('projects ng-content', () => {
    fixture.componentRef.setInput('eyebrow', 'x');
    fixture.componentRef.setInput('title', 'y');
    fixture.componentRef.setInput('text', 'z');
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('.container'))!;
    expect(container).toBeTruthy();
  });
});

describe('EventMetaComponent', () => {
  let fixture: ComponentFixture<EventMetaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [EventMetaComponent] });
    fixture = TestBed.createComponent(EventMetaComponent);
    fixture.detectChanges();
  });

  it('renders event meta items', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.event-meta')).toBeTruthy();
  });
});

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HeaderComponent], providers: [provideRouter([]), provideHttpClient()] });
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('renders navigation links', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sobre');
    expect(el.textContent).toContain('Sócios');
    expect(el.textContent).toContain('Eventos');
    expect(el.textContent).toContain('Contactos');
  });

  it('shows login button when not authenticated', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Área Reservada');
  });
});
