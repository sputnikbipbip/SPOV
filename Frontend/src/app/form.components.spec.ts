import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldComponent, TextareaFieldComponent, FormNotesComponent } from './form.components';

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FormFieldComponent] });
    fixture = TestBed.createComponent(FormFieldComponent);
  });

  it('renders label and input', () => {
    fixture.componentRef.setInput('label', 'Nome');
    fixture.componentRef.setInput('name', 'name');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nome');
    expect(el.querySelector('input')).toBeTruthy();
  });

  it('shows error when invalid and touched', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('name', 'email');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('error', 'Campo obrigatório.');
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Campo obrigatório.');
  });

  it('hides error when valid', () => {
    const control = new FormControl('value', { nonNullable: true, validators: [Validators.required] });
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('name', 'email');
    fixture.componentRef.setInput('control', control);
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Campo obrigatório.');
  });

  it('sets input type from attribute', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('name', 'email');
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('email');
  });
});

describe('TextareaFieldComponent', () => {
  let fixture: ComponentFixture<TextareaFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TextareaFieldComponent] });
    fixture = TestBed.createComponent(TextareaFieldComponent);
  });

  it('renders label and textarea', () => {
    fixture.componentRef.setInput('label', 'Mensagem');
    fixture.componentRef.setInput('name', 'message');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Mensagem');
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
  });

  it('shows error when invalid and touched', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    fixture.componentRef.setInput('label', 'Msg');
    fixture.componentRef.setInput('name', 'msg');
    fixture.componentRef.setInput('control', control);
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Campo obrigatório.');
  });
});

describe('FormNotesComponent', () => {
  let fixture: ComponentFixture<FormNotesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FormNotesComponent] });
    fixture = TestBed.createComponent(FormNotesComponent);
    fixture.detectChanges();
  });

  it('renders privacy note', () => {
    expect(fixture.nativeElement.textContent).toContain('Ao enviar, aceita ser contactado');
  });
});
