import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';
import { I18nProvider } from './i18n/useI18n';

function renderApp() {
  // Força PT nos testes para determinismo (jsdom usa navigator en-US por padrão).
  window.localStorage.setItem('secops-sizing-lang', 'pt');
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  );
}

describe('App (renderização)', () => {
  it('monta sem erros e mostra o título', () => {
    renderApp();
    expect(screen.getByText('SecOps Sizing Engine')).toBeTruthy();
  });

  it('mostra as duas seções numeradas', () => {
    renderApp();
    expect(screen.getByText('Contexto & validação')).toBeTruthy();
    expect(screen.getByText('Inventário de fontes')).toBeTruthy();
  });

  it('mostra o rail de resultado com TB/ano', () => {
    renderApp();
    expect(screen.getByText('Número final da cotação')).toBeTruthy();
    expect(screen.getAllByText('TB/ano').length).toBeGreaterThan(0);
  });

  it('abre o relatório ao clicar em Gerar relatório', () => {
    renderApp();
    fireEvent.click(screen.getByText('Gerar relatório'));
    expect(screen.getByText('Resumo executivo')).toBeTruthy();
    expect(screen.getByText('Ocultar relatório')).toBeTruthy();
  });

  it('recalcula ao preencher uma quantidade', () => {
    renderApp();
    // acha o primeiro input numérico de quantidade na tabela (após o EPS)
    const numberInputs = screen.getAllByRole('spinbutton');
    // o primeiro é o EPS; preenche uma quantidade de fonte
    const qtyInput = numberInputs[1];
    fireEvent.change(qtyInput, { target: { value: '100' } });
    fireEvent.blur(qtyInput);
    // o resultado deixa de ser vazio (não deve mais mostrar a mensagem de empty state)
    expect(screen.queryByText(/Preencha as quantidades/)).toBeNull();
  });

  it('abre o guia de cloud e mostra os providers', () => {
    renderApp();
    fireEvent.click(screen.getByText('Como medir logs da cloud'));
    // título do modal
    expect(screen.getAllByText('Como medir logs da cloud').length).toBeGreaterThan(1);
    // abas dos três providers
    expect(screen.getByText('AWS')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText('Google Cloud')).toBeTruthy();
  });

  it('abre a calculadora rápida e converte 500 GB/dia', () => {
    renderApp();
    fireEvent.click(screen.getByText('Calculadora rápida'));
    // título do modal + resultado padrão (500 GB/dia = 182,5 TB/ano)
    expect(screen.getAllByText('Calculadora rápida').length).toBeGreaterThan(1);
    expect(screen.getByText(/182,5/)).toBeTruthy();
  });

  it('abre o modal Como usar', () => {
    renderApp();
    fireEvent.click(screen.getByText('Como usar'));
    expect(screen.getByText('Como usar esta ferramenta')).toBeTruthy();
    expect(screen.getByText('Entendi')).toBeTruthy();
  });
});
