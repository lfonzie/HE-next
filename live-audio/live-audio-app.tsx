/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {GoogleGenAI, LiveServerMessage, Modality, Session} from '@google/genai';
import {createBlob, decode, decodeAudioData} from './utils';
import {Analyser} from './analyser';
import {liveAudioStyles} from './styles';
import * as THREE from 'three';
import {EXRLoader} from 'three/addons/loaders/EXRLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {fs as backdropFS, vs as backdropVS} from './backdrop-shader';
import {vs as sphereVS} from './sphere-shader';

/**
 * Live Audio App - Componente principal centralizado
 * Integra funcionalidades de áudio em tempo real com visualizações 3D
 */
@customElement('live-audio-app')
export class LiveAudioApp extends LitElement {
  @state() isRecording = false;
  @state() status = '';
  @state() error = '';
  @state() isInitialized = false;

  // Audio contexts e nodes
  private client: GoogleGenAI;
  private session: Session;
  private inputAudioContext = new (window.AudioContext ||
    window.webkitAudioContext)({sampleRate: 16000});
  private outputAudioContext = new (window.AudioContext ||
    window.webkitAudioContext)({sampleRate: 24000});
  @state() inputNode = this.inputAudioContext.createGain();
  @state() outputNode = this.outputAudioContext.createGain();
  private nextStartTime = 0;
  private mediaStream: MediaStream;
  private sourceNode: AudioBufferSourceNode;
  private scriptProcessorNode: ScriptProcessorNode;
  private sources = new Set<AudioBufferSourceNode>();

  // 3D Visualization components
  private inputAnalyser!: Analyser;
  private outputAnalyser!: Analyser;
  private camera!: THREE.PerspectiveCamera;
  private backdrop!: THREE.Mesh;
  private composer!: EffectComposer;
  private sphere!: THREE.Mesh;
  private prevTime = 0;
  private rotation = new THREE.Vector3(0, 0, 0);
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;

  static styles = css`${liveAudioStyles}`;

  constructor() {
    super();
    this.initApp();
  }

  private async initApp() {
    try {
      await this.initAudio();
      await this.initClient();
      await this.init3DVisualization();
      this.isInitialized = true;
      this.updateStatus('Aplicação inicializada. Clique no botão vermelho para começar.');
    } catch (error) {
      console.error('Erro na inicialização:', error);
      this.updateError(`Erro na inicialização: ${error.message}`);
    }
  }

  private initAudio() {
    this.nextStartTime = this.outputAudioContext.currentTime;
    this.outputNode.connect(this.outputAudioContext.destination);
  }

  private async initClient() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    await this.initSession();
  }

  private async initSession() {
    const model = 'gemini-2.5-flash-preview-native-audio-dialog';

    try {
      this.session = await this.client.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            this.updateStatus('Sessão conectada');
          },
          onmessage: async (message: LiveServerMessage) => {
            const audio =
              message.serverContent?.modelTurn?.parts[0]?.inlineData;

            if (audio) {
              this.nextStartTime = Math.max(
                this.nextStartTime,
                this.outputAudioContext.currentTime,
              );

              const audioBuffer = await decodeAudioData(
                decode(audio.data),
                this.outputAudioContext,
                24000,
                1,
              );
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              source.addEventListener('ended', () =>{
                this.sources.delete(source);
              });

              source.start(this.nextStartTime);
              this.nextStartTime = this.nextStartTime + audioBuffer.duration;
              this.sources.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if(interrupted) {
              for(const source of this.sources.values()) {
                source.stop();
                this.sources.delete(source);
              }
              this.nextStartTime = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            this.updateError(e.message);
          },
          onclose: (e: CloseEvent) => {
            this.updateStatus('Conexão fechada: ' + e.reason);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Orus'}},
            // languageCode: 'pt-BR'
          },
        },
      });
    } catch (e) {
      console.error(e);
      this.updateError('Erro ao conectar com o Gemini');
    }
  }

  private async init3DVisualization() {
    // Inicializar analisadores de áudio
    this.inputAnalyser = new Analyser(this.inputNode);
    this.outputAnalyser = new Analyser(this.outputNode);

    // Configurar cena 3D
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);

    // Criar backdrop
    const backdrop = new THREE.Mesh(
      new THREE.IcosahedronGeometry(10, 5),
      new THREE.RawShaderMaterial({
        uniforms: {
          resolution: {value: new THREE.Vector2(1, 1)},
          rand: {value: 0},
        },
        vertexShader: backdropVS,
        fragmentShader: backdropFS,
        glslVersion: THREE.GLSL3,
      }),
    );
    backdrop.material.side = THREE.BackSide;
    scene.add(backdrop);
    this.backdrop = backdrop;

    // Configurar câmera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(2, -2, 5);
    this.camera = camera;

    // Configurar renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio / 1);
    this.renderer = renderer;

    // Criar esfera com material
    const geometry = new THREE.IcosahedronGeometry(1, 10);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x000010,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x000010,
      emissiveIntensity: 1.5,
    });

    sphereMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.time = {value: 0};
      shader.uniforms.inputData = {value: new THREE.Vector4()};
      shader.uniforms.outputData = {value: new THREE.Vector4()};

      sphereMaterial.userData.shader = shader;
      shader.vertexShader = sphereVS;
    };

    const sphere = new THREE.Mesh(geometry, sphereMaterial);
    scene.add(sphere);
    sphere.visible = false;
    this.sphere = sphere;

    // Carregar textura EXR
    new EXRLoader().load('piz_compressed.exr', (texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      sphereMaterial.envMap = exrCubeRenderTarget.texture;
      sphere.visible = true;
    });

    // Configurar efeitos pós-processamento
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      5,
      0.5,
      0,
    );
    const fxaaPass = new ShaderPass(FXAAShader);

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    this.composer = composer;

    // Configurar resize handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const dPR = renderer.getPixelRatio();
      const w = window.innerWidth;
      const h = window.innerHeight;
      backdrop.material.uniforms.resolution.value.set(w * dPR, h * dPR);
      renderer.setSize(w, h);
      composer.setSize(w, h);
      fxaaPass.material.uniforms['resolution'].value.set(
        1 / (w * dPR),
        1 / (h * dPR),
      );
    };

    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    // Iniciar loop de animação
    this.startAnimation();
  }

  private startAnimation() {
    const animate = () => {
      requestAnimationFrame(animate);

      if (this.inputAnalyser && this.outputAnalyser) {
        this.inputAnalyser.update();
        this.outputAnalyser.update();

        const t = performance.now();
        const dt = (t - this.prevTime) / (1000 / 60);
        this.prevTime = t;

        const backdropMaterial = this.backdrop.material as THREE.RawShaderMaterial;
        const sphereMaterial = this.sphere.material as THREE.MeshStandardMaterial;

        backdropMaterial.uniforms.rand.value = Math.random() * 10000;

        if (sphereMaterial.userData.shader) {
          this.sphere.scale.setScalar(
            1 + (0.2 * this.outputAnalyser.data[1]) / 255,
          );

          const f = 0.001;
          this.rotation.x += (dt * f * 0.5 * this.outputAnalyser.data[1]) / 255;
          this.rotation.z += (dt * f * 0.5 * this.inputAnalyser.data[1]) / 255;
          this.rotation.y += (dt * f * 0.25 * this.inputAnalyser.data[2]) / 255;
          this.rotation.y += (dt * f * 0.25 * this.outputAnalyser.data[2]) / 255;

          const euler = new THREE.Euler(
            this.rotation.x,
            this.rotation.y,
            this.rotation.z,
          );
          const quaternion = new THREE.Quaternion().setFromEuler(euler);
          const vector = new THREE.Vector3(0, 0, 5);
          vector.applyQuaternion(quaternion);
          this.camera.position.copy(vector);
          this.camera.lookAt(this.sphere.position);

          sphereMaterial.userData.shader.uniforms.time.value +=
            (dt * 0.1 * this.outputAnalyser.data[0]) / 255;
          sphereMaterial.userData.shader.uniforms.inputData.value.set(
            (1 * this.inputAnalyser.data[0]) / 255,
            (0.1 * this.inputAnalyser.data[1]) / 255,
            (10 * this.inputAnalyser.data[2]) / 255,
            0,
          );
          sphereMaterial.userData.shader.uniforms.outputData.value.set(
            (2 * this.outputAnalyser.data[0]) / 255,
            (0.1 * this.outputAnalyser.data[1]) / 255,
            (10 * this.outputAnalyser.data[2]) / 255,
            0,
          );
        }
      }

      if (this.composer) {
        this.composer.render();
      }
    };

    animate();
  }

  private updateStatus(msg: string) {
    this.status = msg;
  }

  private updateError(msg: string) {
    this.error = msg;
  }

  private async startRecording() {
    if (this.isRecording) {
      return;
    }

    this.inputAudioContext.resume();
    this.updateStatus('Solicitando acesso ao microfone...');

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      this.updateStatus('Acesso ao microfone concedido. Iniciando captura...');

      this.sourceNode = this.inputAudioContext.createMediaStreamSource(
        this.mediaStream,
      );
      this.sourceNode.connect(this.inputNode);

      const bufferSize = 256;
      this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(
        bufferSize,
        1,
        1,
      );

      this.scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
        if (!this.isRecording) return;

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const pcmData = inputBuffer.getChannelData(0);

        this.session.sendRealtimeInput({media: createBlob(pcmData)});
      };

      this.sourceNode.connect(this.scriptProcessorNode);
      this.scriptProcessorNode.connect(this.inputAudioContext.destination);

      this.isRecording = true;
      this.updateStatus('🔴 Gravando... Capturando chunks PCM.');
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      this.updateStatus(`Erro: ${err.message}`);
      this.stopRecording();
    }
  }

  private stopRecording() {
    if (!this.isRecording && !this.mediaStream && !this.inputAudioContext)
      return;

    this.updateStatus('Parando gravação...');

    this.isRecording = false;

    if (this.scriptProcessorNode && this.sourceNode && this.inputAudioContext) {
      this.scriptProcessorNode.disconnect();
      this.sourceNode.disconnect();
    }

    this.scriptProcessorNode = null;
    this.sourceNode = null;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.updateStatus('Gravação parada. Clique em Iniciar para começar novamente.');
  }

  private reset() {
    this.session?.close();
    this.initSession();
    this.updateStatus('Sessão reiniciada.');
  }

  protected firstUpdated() {
    this.canvas = this.shadowRoot!.querySelector('canvas') as HTMLCanvasElement;
  }

  render() {
    if (!this.isInitialized) {
      return html`
        <div class="app-container">
          <div class="header">
            <h1 class="app-title">Live Audio Visualizer</h1>
          </div>
          
          <div class="loading">
            <div class="loading-spinner"></div>
            <div>Inicializando Live Audio App...</div>
            <div style="margin-top: 10px; font-size: 14px; opacity: 0.7;">
              Carregando componentes de áudio e visualização 3D
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="app-container">
        <canvas></canvas>
        
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
            ${this.error ? html`<div class="error">${this.error}</div>` : this.status}
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
