# 📖 Documentação Técnica — App Mata Mosquito

## 1. Visão Geral do Sistema
O **App Mata Mosquito** é uma aplicação web interativa desenvolvida com foco no aprendizado de manipulação do DOM, gestão de eventos, controlo de temporizadores e responsividade dinâmica. O objetivo do jogo é eliminar os mosquitos que surgem aleatoriamente no ecrã dentro do tempo limite, sem esgotar as vidas disponíveis.

---

## 2. Arquitetura e Estrutura do Projeto

A aplicação é dividida nos seguintes ficheiros principais:

* **`index.html`**: Ecrã inicial para seleção do nível de dificuldade e início do jogo.
* **`app.html`**: Palco principal do jogo onde os elementos surgem dinamicamente.
* **`vitoria.html`**: Ecrã exibido quando o jogador conclui o tempo com sucesso.
* **`fim_de_jogo.html`**: Ecrã de derrota quando todas as vidas são perdidas.
* **`estilo.css`**: Estilização do cenário, mosquitos, vidas e contadores.
* **`jogo.js`**: Motor de lógica em JavaScript que gere o ciclo de vida da partida.

---

## 3. Especificações das Funcionalidades

### 3.1. Cálculo de Dimensão da Tela
O sistema ajusta o espaço utilizável dinamicamente com base na resolução da janela do utilizador, garantindo que nenhum elemento surja fora da área visível.

- **Função responsável:** `ajustaTamanhoPalcoJogo()`
- **Propriedades utilizadas:** `window.innerWidth` e `window.innerHeight`

### 3.2. Seleção de Dificuldade
A velocidade de renderização dos mosquitos é configurada no ecrã inicial através de parâmetros passados via URL:

| Nível de Dificuldade | Tempo de Renderização |
| :--- | :--- |
| **Normal** | 1500ms (1,5 segundos) |
| **Difícil** | 1000ms (1,0 segundo) |
| **Chuck Norris** | 750ms (0,75 segundos) |

### 3.3. Lógica de Geração de Mosquitos
A cada intervalo do temporizador, o sistema executa a seguinte sequência:
1. Verifica se já existe um mosquito no ecrã. Se existir e não tiver sido clicado, remove-o e **subtrai uma vida**.
2. Calcula uma posição aleatória dentro dos limites da janela.
3. Aplica um tamanho aleatório ao elemento (Classe 1, 2 ou 3).
4. Aplica um espelhamento horizontal aleatório (Lado A ou B).
5. Adiciona o evento de clique ao elemento (`onclick`) para remoção manual.

### 3.4. Sistema de Vidas
* O jogador inicia com **3 vidas**.
* A perda de uma vida substitui a imagem do coração cheio (`coracao_cheio.png`) por um coração vazio (`coracao_vazio.png`).
* Ao perder a terceira vida, a execução é interrompida e o utilizador é redirecionado para `fim_de_jogo.html`.

### 3.5. Cronómetro e Vitória
* O jogo tem uma duração padrão de **10 segundos** (ou configurada no script).
* Um temporizador reduz o tempo a cada segundo (`setInterval`).
* Se o tempo chegar a zero e o jogador mantiver pelo menos 1 vida, o jogo é interrompido e o utilizador é redirecionado para `vitoria.html`.
