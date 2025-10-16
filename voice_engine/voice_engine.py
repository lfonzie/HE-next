#!/usr/bin/env python3
"""
HubEdu.ia VoiceEngine - Advanced Text-to-Speech Engine
with fallbacks, validation, and pedagogical content support
"""

import asyncio
import logging
import os
import json
import hashlib
import time
from typing import Dict, List, Optional, Union, Any
from dataclasses import dataclass
from enum import Enum
import aiohttp
import aiofiles
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceProvider(Enum):
    OPENAI = "openai"
    GOOGLE_CLOUD = "google_cloud"
    AZURE = "azure"
    AMAZON_POLLY = "amazon_polly"
    ELEVENLABS = "elevenlabs"

class VoiceQuality(Enum):
    STANDARD = "standard"
    NEURAL = "neural"
    PREMIUM = "premium"

@dataclass
class VoiceConfig:
    provider: VoiceProvider
    voice_id: str
    language: str = "pt-BR"
    quality: VoiceQuality = VoiceQuality.NEURAL
    speed: float = 1.0
    pitch: float = 0.0
    volume: float = 1.0
    enable_ssml: bool = True

@dataclass
class AudioOutput:
    audio_data: bytes
    format: str
    duration: float
    provider_used: VoiceProvider
    metadata: Dict[str, Any]

class PedagogicalContentValidator:
    """Validates content for educational appropriateness"""
    
    def __init__(self):
        self.inappropriate_keywords = self._load_inappropriate_keywords()
        self.age_appropriate_content = self._load_age_appropriate_content()
    
    def _load_inappropriate_keywords(self) -> List[str]:
        """Load inappropriate keywords for content filtering"""
        # In a real implementation, this would load from a database or file
        return [
            "violência", "drogas", "álcool", "tabaco", "armas",
            "conteúdo inadequado", "linguagem ofensiva"
        ]
    
    def _load_age_appropriate_content(self) -> Dict[str, List[str]]:
        """Load age-appropriate content guidelines"""
        return {
            "elementary": ["conteúdo básico", "explicações simples"],
            "middle": ["conteúdo intermediário", "exemplos práticos"],
            "high": ["conteúdo avançado", "análise crítica"],
            "university": ["conteúdo especializado", "pesquisa acadêmica"]
        }
    
    def validate_content(self, text: str, target_age: str = "high") -> Dict[str, Any]:
        """Validate content for educational appropriateness"""
        validation_result = {
            "is_valid": True,
            "issues": [],
            "suggestions": [],
            "age_appropriate": True,
            "content_score": 100
        }
        
        # Check for inappropriate content
        text_lower = text.lower()
        for keyword in self.inappropriate_keywords:
            if keyword in text_lower:
                validation_result["is_valid"] = False
                validation_result["issues"].append(f"Conteúdo inadequado detectado: {keyword}")
                validation_result["content_score"] -= 20
        
        # Check age appropriateness
        if target_age in self.age_appropriate_content:
            appropriate_indicators = self.age_appropriate_content[target_age]
            has_appropriate_content = any(indicator in text_lower for indicator in appropriate_indicators)
            
            if not has_appropriate_content:
                validation_result["age_appropriate"] = False
                validation_result["suggestions"].append(f"Considere adicionar conteúdo mais apropriado para {target_age}")
                validation_result["content_score"] -= 10
        
        # Check content length
        if len(text) < 50:
            validation_result["issues"].append("Conteúdo muito curto para uma aula")
            validation_result["content_score"] -= 5
        elif len(text) > 5000:
            validation_result["issues"].append("Conteúdo muito longo, considere dividir em partes")
            validation_result["content_score"] -= 5
        
        return validation_result

class VoiceEngine:
    """Advanced VoiceEngine with multiple TTS providers and fallbacks"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.validator = PedagogicalContentValidator()
        self.cache_dir = Path(config.get("cache_dir", "./audio_cache"))
        self.cache_dir.mkdir(exist_ok=True)
        
        # Initialize providers
        self.providers = self._initialize_providers()
        self.primary_provider = VoiceProvider(config.get("primary_provider", "openai"))
        self.fallback_providers = [
            VoiceProvider(p) for p in config.get("fallback_providers", ["google_cloud", "azure"])
        ]
        
        # Feature flags
        self.feature_flags = config.get("feature_flags", {})
        
        # Audit logging
        self.audit_log = []
    
    def _initialize_providers(self) -> Dict[VoiceProvider, Dict[str, Any]]:
        """Initialize TTS providers with their configurations"""
        providers = {}
        
        # OpenAI configuration
        if os.getenv("OPENAI_API_KEY"):
            providers[VoiceProvider.OPENAI] = {
                "api_key": os.getenv("OPENAI_API_KEY"),
                "base_url": "https://api.openai.com/v1",
                "voices": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
            }
        
        # Google Cloud configuration
        if os.getenv("GOOGLE_CLOUD_API_KEY"):
            providers[VoiceProvider.GOOGLE_CLOUD] = {
                "api_key": os.getenv("GOOGLE_CLOUD_API_KEY"),
                "base_url": "https://texttospeech.googleapis.com/v1",
                "voices": ["pt-BR-Wavenet-A", "pt-BR-Wavenet-B", "pt-BR-Wavenet-C", "pt-BR-Wavenet-D"]
            }
        
        # Azure configuration
        if os.getenv("AZURE_SPEECH_KEY"):
            providers[VoiceProvider.AZURE] = {
                "api_key": os.getenv("AZURE_SPEECH_KEY"),
                "region": os.getenv("AZURE_SPEECH_REGION", "eastus"),
                "voices": ["pt-BR-FranciscaNeural", "pt-BR-AntonioNeural"]
            }
        
        return providers
    
    async def generate_audio(
        self,
        text: str,
        voice_config: VoiceConfig,
        target_age: str = "high",
        enable_validation: bool = True,
        enable_caching: bool = True
    ) -> AudioOutput:
        """Generate audio with validation, caching, and fallbacks"""
        
        # Validate content if enabled
        if enable_validation:
            validation_result = self.validator.validate_content(text, target_age)
            if not validation_result["is_valid"]:
                logger.warning(f"Content validation failed: {validation_result['issues']}")
                # Log for audit purposes
                self._log_audit_event("content_validation_failed", {
                    "text_preview": text[:100],
                    "issues": validation_result["issues"],
                    "target_age": target_age
                })
        
        # Check cache first
        if enable_caching:
            cached_audio = await self._get_cached_audio(text, voice_config)
            if cached_audio:
                logger.info("Using cached audio")
                return cached_audio
        
        # Generate audio with fallbacks
        audio_output = await self._generate_with_fallbacks(text, voice_config)
        
        # Cache the result
        if enable_caching:
            await self._cache_audio(text, voice_config, audio_output)
        
        # Log successful generation
        self._log_audit_event("audio_generated", {
            "text_length": len(text),
            "provider_used": audio_output.provider_used.value,
            "duration": audio_output.duration,
            "target_age": target_age
        })
        
        return audio_output
    
    async def _generate_with_fallbacks(
        self,
        text: str,
        voice_config: VoiceConfig
    ) -> AudioOutput:
        """Generate audio with provider fallbacks"""
        
        providers_to_try = [self.primary_provider] + self.fallback_providers
        
        for provider in providers_to_try:
            if provider not in self.providers:
                logger.warning(f"Provider {provider.value} not configured, skipping")
                continue
            
            try:
                logger.info(f"Attempting to generate audio with {provider.value}")
                audio_output = await self._generate_with_provider(text, voice_config, provider)
                
                if audio_output:
                    logger.info(f"Successfully generated audio with {provider.value}")
                    return audio_output
                    
            except Exception as e:
                logger.error(f"Failed to generate audio with {provider.value}: {str(e)}")
                continue
        
        raise Exception("All TTS providers failed to generate audio")
    
    async def _generate_with_provider(
        self,
        text: str,
        voice_config: VoiceConfig,
        provider: VoiceProvider
    ) -> Optional[AudioOutput]:
        """Generate audio with a specific provider"""
        
        if provider == VoiceProvider.OPENAI:
            return await self._generate_openai(text, voice_config)
        elif provider == VoiceProvider.GOOGLE_CLOUD:
            return await self._generate_google_cloud(text, voice_config)
        elif provider == VoiceProvider.AZURE:
            return await self._generate_azure(text, voice_config)
        else:
            logger.warning(f"Provider {provider.value} not implemented")
            return None
    
    async def _generate_openai(self, text: str, voice_config: VoiceConfig) -> AudioOutput:
        """Generate audio using OpenAI TTS"""
        provider_config = self.providers[VoiceProvider.OPENAI]
        
        headers = {
            "Authorization": f"Bearer {provider_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "tts-1",
            "input": text,
            "voice": voice_config.voice_id,
            "response_format": "mp3"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{provider_config['base_url']}/audio/speech",
                headers=headers,
                json=data
            ) as response:
                if response.status == 200:
                    audio_data = await response.read()
                    return AudioOutput(
                        audio_data=audio_data,
                        format="mp3",
                        duration=len(audio_data) / 16000,  # Rough estimate
                        provider_used=VoiceProvider.OPENAI,
                        metadata={"model": "tts-1", "voice": voice_config.voice_id}
                    )
                else:
                    raise Exception(f"OpenAI API error: {response.status}")
    
    async def _generate_google_cloud(self, text: str, voice_config: VoiceConfig) -> AudioOutput:
        """Generate audio using Google Cloud TTS"""
        provider_config = self.providers[VoiceProvider.GOOGLE_CLOUD]
        
        url = f"{provider_config['base_url']}/text:synthesize?key={provider_config['api_key']}"
        
        data = {
            "input": {"text": text},
            "voice": {
                "languageCode": voice_config.language,
                "name": voice_config.voice_id,
                "ssmlGender": "NEUTRAL"
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": voice_config.speed,
                "pitch": voice_config.pitch,
                "volumeGainDb": 0.0
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    audio_data = result["audioContent"].encode()
                    
                    return AudioOutput(
                        audio_data=audio_data,
                        format="mp3",
                        duration=len(audio_data) / 16000,  # Rough estimate
                        provider_used=VoiceProvider.GOOGLE_CLOUD,
                        metadata={"voice": voice_config.voice_id, "language": voice_config.language}
                    )
                else:
                    raise Exception(f"Google Cloud TTS error: {response.status}")
    
    async def _generate_azure(self, text: str, voice_config: VoiceConfig) -> AudioOutput:
        """Generate audio using Azure Speech Services"""
        provider_config = self.providers[VoiceProvider.AZURE]
        
        # Azure Speech Services implementation would go here
        # This is a simplified version
        raise NotImplementedError("Azure TTS implementation pending")
    
    def _get_cache_key(self, text: str, voice_config: VoiceConfig) -> str:
        """Generate cache key for audio"""
        content = f"{text}_{voice_config.provider.value}_{voice_config.voice_id}_{voice_config.language}"
        return hashlib.md5(content.encode()).hexdigest()
    
    async def _get_cached_audio(
        self,
        text: str,
        voice_config: VoiceConfig
    ) -> Optional[AudioOutput]:
        """Get cached audio if available"""
        cache_key = self._get_cache_key(text, voice_config)
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        if cache_file.exists():
            try:
                async with aiofiles.open(cache_file, 'r') as f:
                    cache_data = json.loads(await f.read())
                
                # Check if cache is still valid (24 hours)
                if time.time() - cache_data["timestamp"] < 86400:
                    audio_file = self.cache_dir / f"{cache_key}.mp3"
                    if audio_file.exists():
                        async with aiofiles.open(audio_file, 'rb') as f:
                            audio_data = await f.read()
                        
                        return AudioOutput(
                            audio_data=audio_data,
                            format=cache_data["format"],
                            duration=cache_data["duration"],
                            provider_used=VoiceProvider(cache_data["provider_used"]),
                            metadata=cache_data["metadata"]
                        )
            except Exception as e:
                logger.error(f"Error reading cache: {str(e)}")
        
        return None
    
    async def _cache_audio(
        self,
        text: str,
        voice_config: VoiceConfig,
        audio_output: AudioOutput
    ) -> None:
        """Cache generated audio"""
        cache_key = self._get_cache_key(text, voice_config)
        
        try:
            # Save audio data
            audio_file = self.cache_dir / f"{cache_key}.mp3"
            async with aiofiles.open(audio_file, 'wb') as f:
                await f.write(audio_output.audio_data)
            
            # Save metadata
            cache_data = {
                "timestamp": time.time(),
                "format": audio_output.format,
                "duration": audio_output.duration,
                "provider_used": audio_output.provider_used.value,
                "metadata": audio_output.metadata
            }
            
            cache_file = self.cache_dir / f"{cache_key}.json"
            async with aiofiles.open(cache_file, 'w') as f:
                await f.write(json.dumps(cache_data))
                
        except Exception as e:
            logger.error(f"Error caching audio: {str(e)}")
    
    def _log_audit_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Log audit events for compliance"""
        audit_entry = {
            "timestamp": time.time(),
            "event_type": event_type,
            "data": data,
            "user_id": data.get("user_id", "anonymous"),
            "session_id": data.get("session_id", "unknown")
        }
        
        self.audit_log.append(audit_entry)
        
        # In a real implementation, this would be sent to a secure audit log system
        logger.info(f"Audit event: {event_type} - {data}")
    
    async def get_available_voices(self, language: str = "pt-BR") -> Dict[str, List[str]]:
        """Get available voices for each provider"""
        voices = {}
        
        for provider, config in self.providers.items():
            if provider == VoiceProvider.OPENAI:
                voices["openai"] = config["voices"]
            elif provider == VoiceProvider.GOOGLE_CLOUD:
                voices["google_cloud"] = [v for v in config["voices"] if v.startswith(language)]
            elif provider == VoiceProvider.AZURE:
                voices["azure"] = [v for v in config["voices"] if language in v]
        
        return voices
    
    def get_audit_log(self) -> List[Dict[str, Any]]:
        """Get audit log for compliance reporting"""
        return self.audit_log.copy()
    
    def clear_audit_log(self) -> None:
        """Clear audit log (for testing purposes)"""
        self.audit_log.clear()

# Example usage and testing
async def main():
    """Example usage of the VoiceEngine"""
    
    config = {
        "primary_provider": "openai",
        "fallback_providers": ["google_cloud", "azure"],
        "cache_dir": "./audio_cache",
        "feature_flags": {
            "enable_validation": True,
            "enable_caching": True,
            "enable_audit_logging": True
        }
    }
    
    engine = VoiceEngine(config)
    
    # Test voice configuration
    voice_config = VoiceConfig(
        provider=VoiceProvider.OPENAI,
        voice_id="alloy",
        language="pt-BR",
        quality=VoiceQuality.NEURAL,
        speed=1.0
    )
    
    # Test text
    test_text = """
    Bem-vindos à aula de matemática! Hoje vamos aprender sobre equações quadráticas.
    Uma equação quadrática é uma equação polinomial de segundo grau.
    Vamos começar com exemplos práticos para facilitar o entendimento.
    """
    
    try:
        # Generate audio
        audio_output = await engine.generate_audio(
            text=test_text,
            voice_config=voice_config,
            target_age="high",
            enable_validation=True,
            enable_caching=True
        )
        
        print(f"Audio generated successfully!")
        print(f"Provider used: {audio_output.provider_used.value}")
        print(f"Duration: {audio_output.duration:.2f} seconds")
        print(f"Format: {audio_output.format}")
        
        # Save audio file
        output_file = "test_audio.mp3"
        with open(output_file, "wb") as f:
            f.write(audio_output.audio_data)
        print(f"Audio saved to {output_file}")
        
        # Get available voices
        voices = await engine.get_available_voices()
        print(f"Available voices: {voices}")
        
        # Get audit log
        audit_log = engine.get_audit_log()
        print(f"Audit log entries: {len(audit_log)}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
