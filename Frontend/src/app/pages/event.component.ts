import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { posterUrl, speakers } from '../content';
import { FormFieldComponent, FormNotesComponent, TextareaFieldComponent } from '../form.components';
import { EventMetaComponent } from '../shared.components';
import { ContactsService } from '../services/contacts.service';
import { EventsService, EventDto } from '../services/events.service';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, EventMetaComponent, FormFieldComponent, TextareaFieldComponent, FormNotesComponent],
  template: `
    <section class="section event-hero"><div class="container event-hero-grid"><div><span class="badge badge-yellow">20% desconto sócios AEVPORT</span><h1>{{ event?.title ?? 'Evento' }}</h1><p>{{ event?.description ?? '' }}</p><div class="hero-actions"><a class="button button-light" href="#inscricao">Inscrever-me</a><a routerLink="/socios" class="button button-secondary-light">Tornar-me sócio</a></div></div><div class="event-panel"><span class="eyebrow eyebrow-light">{{ event?.title ?? 'Evento' }}</span><app-event-meta [invert]="true" /><img class="section-image section-image-contrast" [src]="posterUrl" alt="Material visual do evento SPOV"></div></div></section>
    <section class="section"><div class="container content-grid">@for (card of cards; track card.title) { <article class="content-card"><img class="card-image" [src]="posterUrl" [alt]="card.title" loading="lazy" decoding="async"><h3>{{ card.title }}</h3><p>{{ card.text }}</p></article> }</div></section>
    <section class="section section-soft"><div class="container program-section"><div class="section-heading"><span class="eyebrow">Programa</span><h2>Agenda modular com leitura clara.</h2></div><div class="program-list">@for (item of program; track item.time) { <div class="program-item"><strong>{{ item.time }}</strong><span>{{ item.title }}</span></div> }</div></div></section>
    <section class="section"><div class="container"><div class="section-heading"><span class="eyebrow">Oradores e temas</span><h2>Blocos simples para manter a página leve.</h2></div><div class="content-grid">@for (speaker of speakers; track speaker.name) { <article class="content-card"><img class="card-image" [src]="posterUrl" alt="Visual SPOV"><h3>{{ speaker.name }}</h3><p>{{ speaker.role }}</p></article> }</div></div></section>
    <section class="section"><div class="container split-section"><div><span class="eyebrow">FAQ</span><h2>Respostas curtas para reduzir atrito na inscrição.</h2></div><div class="faq-list compact"><article class="faq-item"><h3>Quem deve participar?</h3><p>Perfis de enfermagem veterinária, equipas clínicas e profissionais interessados em oncologia.</p></article><article class="faq-item"><h3>Existe benefício para sócios?</h3><p>O evento pode incluir condições especiais ou descontos identificados em badge.</p></article><article class="faq-item"><h3>Onde pedir apoio?</h3><p>O formulário abaixo concentra pedidos de informação e acompanhamento inicial.</p></article></div></div></section>
    <section class="section section-soft"><div class="container"><div class="section-heading"><span class="eyebrow">Parceiros</span><h2>Apoios visíveis sem competir com a marca SPOV.</h2></div><div class="partner-grid">@for (name of partners; track name) { <div class="partner-card">{{ name }}</div> }</div></div></section>
    <section class="section section-soft" id="inscricao"><div class="container split-section"><div><span class="eyebrow">Informação útil</span><h2>Local, público e inscrição com acesso direto.</h2><p>Hotel Coimbra Aeminium. Evento dirigido a perfis clínicos, de enfermagem e equipas interessadas em oncologia veterinária.</p><img class="section-image" [src]="posterUrl" alt="Material gráfico SPOV para inscrição"></div>
      @if (error) { <div class="form-error-banner">{{ error }}</div> }
      <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <app-form-notes /><app-form-field label="Nome" name="name" [control]="form.controls.name" placeholder="Nome completo" /><app-form-field label="Email" name="email" type="email" [control]="form.controls.email" placeholder="nome@exemplo.pt" error="Indique um email válido." /><app-textarea-field label="Observações" name="notes" [control]="form.controls.notes" placeholder="Pedidos de informação, perfil ou questões práticas" /><button type="submit" class="button button-primary" [disabled]="loading">{{ loading ? 'A enviar…' : 'Pedir informação' }}</button></form></div></section>
  `
})
export class EventComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventsService = inject(EventsService);
  private readonly contactsService = inject(ContactsService);
  protected readonly posterUrl = posterUrl;
  protected readonly speakers = speakers;
  protected event: EventDto | null = null;
  protected loading = false;
  protected error = '';
  protected readonly cards = [
    { title: 'Atualização científica', text: 'Conteúdos essenciais organizados para aplicação prática em contexto clínico.' },
    { title: 'Networking', text: 'Ligação entre equipas, sócios e profissionais com interesses comuns.' },
    { title: 'Utilidade imediata', text: 'Formato pensado para leitura rápida, orientação clara e benefício concreto.' }
  ];
  protected readonly program = [
    { time: '09:00', title: 'Abertura e enquadramento clínico' },
    { time: '11:00', title: 'Fluxos de acompanhamento do doente oncológico' },
    { time: '14:00', title: 'Boas práticas de enfermagem veterinária' },
    { time: '16:00', title: 'Mesa de partilha e perguntas' }
  ];
  protected readonly partners = ['AEVPORT', 'Patrocinador Científico', 'Apoio Técnico', 'Parceiro Institucional'];
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    notes: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      await this.router.navigate(['/eventos']);
      return;
    }
    try {
      this.event = await this.eventsService.getById(id);
    } catch {
      await this.router.navigate(['/eventos']);
    }
  }

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const { name, email, notes } = this.form.getRawValue();
      await this.contactsService.send({
        name, email,
        subject: 'Inscrição em evento',
        message: `Evento: ${this.event?.title ?? '—'}\nObservações: ${notes}`
      });
      await this.router.navigate(['/obrigado']);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Ocorreu um erro. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
