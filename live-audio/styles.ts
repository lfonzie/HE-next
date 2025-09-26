/**
 * Live Audio App - Estilos centralizados
 * Contém todos os estilos para o aplicativo de áudio em tempo real
 */

export const liveAudioStyles = `
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

  canvas {
    width: 100% !important;
    height: 100% !important;
    position: absolute;
    inset: 0;
    image-rendering: pixelated;
    z-index: 1;
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

  .control-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  .control-button:hover::before {
    transform: translateX(100%);
  }

  .control-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .control-button:active {
    transform: scale(1.05) translateY(0);
  }

  .control-button[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }

  .recording-button {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.3));
    border-color: rgba(220, 38, 38, 0.6);
    animation: pulse 2s infinite;
  }

  .recording-button:hover {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(185, 28, 28, 0.5));
    box-shadow: 0 0 30px rgba(220, 38, 38, 0.4);
  }

  .stop-button {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 20, 0.4));
    border-color: rgba(255, 255, 255, 0.4);
  }

  .stop-button:hover {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 0.6));
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
  }

  .reset-button {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3));
    border-color: rgba(59, 130, 246, 0.6);
  }

  .reset-button:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.5));
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
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

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 20px;
    text-align: center;
    z-index: 30;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .error {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.15);
    padding: 15px 25px;
    border-radius: 15px;
    border: 1px solid rgba(255, 107, 107, 0.4);
    backdrop-filter: blur(15px);
    margin: 10px 0;
    animation: shake 0.5s ease-in-out;
  }

  .success {
    color: #51cf66;
    background: rgba(81, 207, 102, 0.15);
    padding: 15px 25px;
    border-radius: 15px;
    border: 1px solid rgba(81, 207, 102, 0.4);
    backdrop-filter: blur(15px);
    margin: 10px 0;
  }

  .info {
    color: #74c0fc;
    background: rgba(116, 192, 252, 0.15);
    padding: 15px 25px;
    border-radius: 15px;
    border: 1px solid rgba(116, 192, 252, 0.4);
    backdrop-filter: blur(15px);
    margin: 10px 0;
  }

  /* Animações */
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

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .app-title {
      font-size: 20px;
    }

    .controls {
      gap: 20px;
      padding: 15px 25px;
    }

    .control-button {
      width: 60px;
      height: 60px;
      font-size: 20px;
    }

    .status {
      font-size: 14px;
      padding: 12px 20px;
    }

    .loading {
      font-size: 18px;
    }
  }

  @media (max-width: 480px) {
    .app-title {
      font-size: 18px;
    }

    .controls {
      gap: 15px;
      padding: 12px 20px;
    }

    .control-button {
      width: 55px;
      height: 55px;
      font-size: 18px;
    }

    .status {
      font-size: 13px;
      padding: 10px 18px;
    }

    .loading {
      font-size: 16px;
    }
  }

  /* Modo escuro adicional */
  @media (prefers-color-scheme: dark) {
    .app-container {
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #0a0a0a 100%);
    }
  }

  /* Acessibilidade */
  @media (prefers-reduced-motion: reduce) {
    .control-button {
      transition: none;
    }
    
    .recording-button {
      animation: none;
    }
    
    .loading-spinner {
      animation: none;
    }

    .controls {
      animation: none;
    }

    .status {
      animation: none;
    }
  }

  /* Estados de foco para acessibilidade */
  .control-button:focus {
    outline: 3px solid #74c0fc;
    outline-offset: 3px;
  }

  /* Melhorias para dispositivos de toque */
  @media (hover: none) and (pointer: coarse) {
    .control-button:hover {
      transform: none;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .control-button:active {
      transform: scale(0.95);
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

export default liveAudioStyles;
