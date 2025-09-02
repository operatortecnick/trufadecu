using TrufadecuTTS.Services;
using System.Text.Json;

namespace TrufadecuTTS.Services;

public class MockTtsService : ITtsService
{
    private readonly HttpClient _httpClient;

    public MockTtsService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public Task<List<VoiceInfo>> GetAvailableVoicesAsync()
    {
        // Mock data showing available voices from Google Cloud TTS
        return Task.FromResult(new List<VoiceInfo>
        {
            new VoiceInfo { Name = "en-US-Wavenet-A", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Wavenet-B", LanguageCode = "en-US", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Wavenet-C", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Wavenet-D", LanguageCode = "en-US", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-A", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-C", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-D", LanguageCode = "en-US", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-E", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-F", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-G", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-H", LanguageCode = "en-US", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-I", LanguageCode = "en-US", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "en-US-Neural2-J", LanguageCode = "en-US", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "pt-BR-Wavenet-A", LanguageCode = "pt-BR", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "pt-BR-Wavenet-B", LanguageCode = "pt-BR", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "pt-BR-Neural2-A", LanguageCode = "pt-BR", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "pt-BR-Neural2-B", LanguageCode = "pt-BR", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "es-ES-Wavenet-A", LanguageCode = "es-ES", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "es-ES-Wavenet-B", LanguageCode = "es-ES", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "fr-FR-Wavenet-A", LanguageCode = "fr-FR", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "fr-FR-Wavenet-B", LanguageCode = "fr-FR", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "de-DE-Wavenet-A", LanguageCode = "de-DE", Gender = "FEMALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "de-DE-Wavenet-B", LanguageCode = "de-DE", Gender = "MALE", NaturalSampleRateHertz = 24000 },
            new VoiceInfo { Name = "ja-JP-Wavenet-A", LanguageCode = "ja-JP", Gender = "FEMALE", NaturalSampleRateHertz = 22050 },
            new VoiceInfo { Name = "ja-JP-Wavenet-B", LanguageCode = "ja-JP", Gender = "FEMALE", NaturalSampleRateHertz = 22050 },
            new VoiceInfo { Name = "ko-KR-Wavenet-A", LanguageCode = "ko-KR", Gender = "FEMALE", NaturalSampleRateHertz = 22050 },
            new VoiceInfo { Name = "ko-KR-Wavenet-B", LanguageCode = "ko-KR", Gender = "FEMALE", NaturalSampleRateHertz = 22050 },
        });
    }

    public Task<byte[]?> SynthesizeTextAsync(TtsRequest request)
    {
        // In a real implementation, this would call Google Cloud TTS API
        // For now, return null to indicate that the server-side implementation is needed
        return Task.FromResult<byte[]?>(null);
    }
}