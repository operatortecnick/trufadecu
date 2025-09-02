using System.ComponentModel.DataAnnotations;

namespace TrufadecuTTS.Services;

public interface ITtsService
{
    Task<byte[]?> SynthesizeTextAsync(TtsRequest request);
    Task<List<VoiceInfo>> GetAvailableVoicesAsync();
}

public class TtsRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
    
    public string LanguageCode { get; set; } = "en-US";
    public string VoiceName { get; set; } = "";
    public string Gender { get; set; } = "NEUTRAL";
    public string AudioEncoding { get; set; } = "MP3";
    public double SpeakingRate { get; set; } = 1.0;
    public double Pitch { get; set; } = 0.0;
    public double VolumeGainDb { get; set; } = 0.0;
}

public class VoiceInfo
{
    public string Name { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public int NaturalSampleRateHertz { get; set; }
}