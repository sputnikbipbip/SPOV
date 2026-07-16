import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [PageIntroComponent],
  template: `
<app-page-intro [eyebrow]="data['eyebrow']" [title]="data['title']" [text]="data['text']">
  @if (data['eyebrow'] === 'Privacidade') {
    <div class="legal-card">
      <p>A Sociedade Portuguesa de Oncologia Veterinária (SPOV) respeita a privacidade dos seus associados, parceiros e visitantes do website.</p>
      <h3>Dados recolhidos</h3>
      <p>Recolhemos apenas os dados estritamente necessários ao funcionamento da associação: nome, email e perfil profissional, fornecidos voluntariamente através dos formulários de contacto e de adesão.</p>
      <h3>Finalidade</h3>
      <p>Os dados são utilizados para processar pedidos de informação, gerir adesões e comunicar com os associados no âmbito das atividades da SPOV. Não são partilhados com terceiros sem consentimento explícito.</p>
      <h3>Direitos</h3>
      <p>Nos termos do RGPD, pode solicitar a qualquer momento a retificação ou eliminação dos seus dados através do email <a href="mailto:geral.spov@gmail.com">geral.spov@gmail.com</a>.</p>
    </div>
  }
  @if (data['eyebrow'] === 'Cookies') {
    <div class="legal-card">
      <p>Este website utiliza apenas cookies técnicos e essenciais ao seu funcionamento. Não são utilizados cookies de rastreio, publicitários ou de terceiros.</p>
      <h3>Cookies necessários</h3>
      <p>Os cookies necessários garantem o correto funcionamento da navegação e das funcionalidades básicas do site, como a autenticação e a apresentação de conteúdo.</p>
      <h3>Alterações</h3>
      <p>Caso venhamos a utilizar cookies adicionais no futuro, esta política será atualizada e os visitantes serão informados no momento da primeira visita.</p>
    </div>
  }
  @if (data['eyebrow'] === 'Acessibilidade') {
    <div class="legal-card">
      <p>A SPOV está empenhada em tornar o seu website acessível a todos os utilizadores, independentemente das suas capacidades ou do dispositivo utilizado.</p>
      <h3>Padrões</h3>
      <p>O website foi desenvolvido seguindo as boas práticas de acessibilidade web, incluindo contraste adequado, foco visível, estrutura semântica e compatibilidade com leitores de ecrã.</p>
      <h3>Navegação</h3>
      <p>Todas as páginas são navegáveis por teclado, com indicadores de foco visíveis. O conteúdo está estruturado com headings hierárquicos e landmarks ARIA para facilitar a navegação por tecnologias de apoio.</p>
      <h3>Contacto</h3>
      <p>Se encontrar alguma barreira de acessibilidade, agradecemos que nos informe através do email <a href="mailto:geral.spov@gmail.com">geral.spov@gmail.com</a>.</p>
    </div>
  }
</app-page-intro>
  `
})
export class LegalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected data: Record<string, string> = {};

  ngOnInit() {
    this.data = this.route.snapshot.data as Record<string, string>;
  }
}
