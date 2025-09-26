/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

/**
 * Live Audio App - Componente de teste simplificado
 */
@customElement('live-audio-app')
export class LiveAudioApp extends LitElement {
  @state() isRecording = false;
  @state() status = 'Aplicativo carregado com sucesso!';

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .app-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f23 100%);
      display: flex;
      flex-direction: column;
    }

    .header {
      position: relative;
      z-index: 20;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .app-title {
      color: white;
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin: 0;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
      background: linear-gradient(45deg, #ffffff, #a0a0a0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .controls-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
    }

    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      gap: 25px;
      background: rgba(0, 0, 0, 0.6);
      padding: 20px 30px;
      border-radius: 30px;
      backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
      animation: fadeInScale 0.8s ease-out;
    }

    .control-button {
      outline: none;
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      width: 70px;
      height: 70px;
      cursor: pointer;
      font-size: 24px;
      padding: 0;
      margin: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(15px);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }

    .control-button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .recording-button {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.3));
      border-color: rgba(220, 38, 38, 0.6);
      animation: pulse 2s infinite;
    }

    .stop-button {
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 20, 0.4));
      border-color: rgba(255, 255, 255, 0.4);
    }

    .reset-button {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3));
      border-color: rgba(59, 130, 246, 0.6);
    }

    .status-container {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      text-align: center;
      max-width: 80%;
    }

    .status {
      color: white;
      font-size: 16px;
      text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
      pointer-events: none;
      padding: 15px 25px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 20px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
      }
      70% {
        box-shadow: 0 0 0 20px rgba(220, 38, 38, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;

  constructor() {
    super();
  }

  private startRecording() {
    this.isRecording = true;
    this.status = '🔴 Gravando...';
  }

  private stopRecording() {
    this.isRecording = false;
    this.status = 'Gravação parada.';
  }

  private reset() {
    this.isRecording = false;
    this.status = 'Sessão reiniciada.';
  }

  render() {
    return html`
      <div class="app-container">
        <div class="header">
          <h1 class="app-title">Live Audio Visualizer</h1>
        </div>
        
        <div class="controls-container">
          <div class="controls">
            <button
              class="control-button reset-button"
              @click=${this.reset}
              ?disabled=${this.isRecording}
              title="Resetar sessão">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="#ffffff">
                <path
                  d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
              </svg>
            </button>
            
            <button
              class="control-button recording-button"
              @click=${this.startRecording}
              ?disabled=${this.isRecording}
              title="Iniciar gravação">
              <svg
                viewBox="0 0 100 100"
                width="28px"
                height="28px"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" />
              </svg>
            </button>
            
            <button
              class="control-button stop-button"
              @click=${this.stopRecording}
              ?disabled=${!this.isRecording}
              title="Parar gravação">
              <svg
                viewBox="0 0 100 100"
                width="28px"
                height="28px"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="100" height="100" rx="15" />
              </svg>
            </button>
          </div>
        </div>

        <div class="status-container">
          <div class="status">
            ${this.status}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'live-audio-app': LiveAudioApp;
  }
}
