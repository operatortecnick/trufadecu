const { ipcRenderer } = require('electron');
const textToSpeech = require('@google-cloud/text-to-speech');

// Application state
let ttsClient = null;
let currentCredentials = null;
let currentAudioBuffer = null;
let currentAudio = null;

// Voice configurations for different languages
const voiceConfigs = {
    'en-US': [
        { name: 'en-US-Wavenet-A', gender: 'Male', type: 'Wavenet' },
        { name: 'en-US-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'en-US-Wavenet-C', gender: 'Female', type: 'Wavenet' },
        { name: 'en-US-Wavenet-D', gender: 'Male', type: 'Wavenet' },
        { name: 'en-US-Wavenet-E', gender: 'Female', type: 'Wavenet' },
        { name: 'en-US-Wavenet-F', gender: 'Female', type: 'Wavenet' },
        { name: 'en-US-Neural2-A', gender: 'Male', type: 'Neural2' },
        { name: 'en-US-Neural2-C', gender: 'Female', type: 'Neural2' },
        { name: 'en-US-Neural2-D', gender: 'Male', type: 'Neural2' },
        { name: 'en-US-Neural2-F', gender: 'Female', type: 'Neural2' }
    ],
    'en-GB': [
        { name: 'en-GB-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'en-GB-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'en-GB-Wavenet-C', gender: 'Female', type: 'Wavenet' },
        { name: 'en-GB-Wavenet-D', gender: 'Male', type: 'Wavenet' }
    ],
    'es-ES': [
        { name: 'es-ES-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'es-ES-Wavenet-C', gender: 'Female', type: 'Wavenet' },
        { name: 'es-ES-Wavenet-D', gender: 'Female', type: 'Wavenet' }
    ],
    'es-US': [
        { name: 'es-US-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'es-US-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'es-US-Wavenet-C', gender: 'Male', type: 'Wavenet' }
    ],
    'fr-FR': [
        { name: 'fr-FR-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'fr-FR-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'fr-FR-Wavenet-C', gender: 'Female', type: 'Wavenet' },
        { name: 'fr-FR-Wavenet-D', gender: 'Male', type: 'Wavenet' }
    ],
    'de-DE': [
        { name: 'de-DE-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'de-DE-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'de-DE-Wavenet-C', gender: 'Female', type: 'Wavenet' },
        { name: 'de-DE-Wavenet-D', gender: 'Male', type: 'Wavenet' }
    ],
    'it-IT': [
        { name: 'it-IT-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'it-IT-Wavenet-B', gender: 'Female', type: 'Wavenet' },
        { name: 'it-IT-Wavenet-C', gender: 'Male', type: 'Wavenet' },
        { name: 'it-IT-Wavenet-D', gender: 'Male', type: 'Wavenet' }
    ],
    'pt-BR': [
        { name: 'pt-BR-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'pt-BR-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'pt-BR-Wavenet-C', gender: 'Female', type: 'Wavenet' }
    ],
    'ja-JP': [
        { name: 'ja-JP-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'ja-JP-Wavenet-B', gender: 'Female', type: 'Wavenet' },
        { name: 'ja-JP-Wavenet-C', gender: 'Male', type: 'Wavenet' },
        { name: 'ja-JP-Wavenet-D', gender: 'Male', type: 'Wavenet' }
    ],
    'ko-KR': [
        { name: 'ko-KR-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'ko-KR-Wavenet-B', gender: 'Female', type: 'Wavenet' },
        { name: 'ko-KR-Wavenet-C', gender: 'Male', type: 'Wavenet' },
        { name: 'ko-KR-Wavenet-D', gender: 'Male', type: 'Wavenet' }
    ],
    'zh-CN': [
        { name: 'cmn-CN-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'cmn-CN-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'cmn-CN-Wavenet-C', gender: 'Male', type: 'Wavenet' },
        { name: 'cmn-CN-Wavenet-D', gender: 'Female', type: 'Wavenet' }
    ],
    'zh-TW': [
        { name: 'cmn-TW-Wavenet-A', gender: 'Female', type: 'Wavenet' },
        { name: 'cmn-TW-Wavenet-B', gender: 'Male', type: 'Wavenet' },
        { name: 'cmn-TW-Wavenet-C', gender: 'Male', type: 'Wavenet' }
    ]
};

// DOM Elements
const elements = {
    loadCredentials: document.getElementById('load-credentials'),
    credentialsStatus: document.getElementById('credentials-status'),
    textInput: document.getElementById('text-input'),
    charCount: document.getElementById('char-count'),
    languageSelect: document.getElementById('language-select'),
    voiceNameSelect: document.getElementById('voice-name'),
    audioFormat: document.getElementById('audio-format'),
    speedControl: document.getElementById('speed-control'),
    speedValue: document.getElementById('speed-value'),
    pitchControl: document.getElementById('pitch-control'),
    pitchValue: document.getElementById('pitch-value'),
    generateSpeech: document.getElementById('generate-speech'),
    playAudio: document.getElementById('play-audio'),
    stopAudio: document.getElementById('stop-audio'),
    saveAudio: document.getElementById('save-audio'),
    generationStatus: document.getElementById('generation-status'),
    audioPlayer: document.getElementById('audio-player'),
    audioInfo: document.getElementById('audio-info')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateVoiceOptions();
});

function initializeEventListeners() {
    // Credentials
    elements.loadCredentials.addEventListener('click', loadCredentials);

    // Text input
    elements.textInput.addEventListener('input', updateCharCount);

    // Voice configuration
    elements.languageSelect.addEventListener('change', updateVoiceOptions);
    elements.speedControl.addEventListener('input', updateSpeedValue);
    elements.pitchControl.addEventListener('input', updatePitchValue);

    // Controls
    elements.generateSpeech.addEventListener('click', generateSpeech);
    elements.playAudio.addEventListener('click', playAudio);
    elements.stopAudio.addEventListener('click', stopAudio);
    elements.saveAudio.addEventListener('click', saveAudio);

    // Audio player
    elements.audioPlayer.addEventListener('ended', () => {
        elements.playAudio.disabled = false;
        elements.stopAudio.disabled = true;
    });
}

async function loadCredentials() {
    try {
        const result = await ipcRenderer.invoke('load-credentials');
        
        if (result.success) {
            currentCredentials = result.credentials;
            
            // Initialize TTS client with credentials
            ttsClient = new textToSpeech.TextToSpeechClient({
                credentials: currentCredentials
            });

            showStatus(elements.credentialsStatus, 'Credentials loaded successfully!', 'success');
            elements.generateSpeech.disabled = false;
        } else {
            showStatus(elements.credentialsStatus, `Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showStatus(elements.credentialsStatus, `Error loading credentials: ${error.message}`, 'error');
    }
}

function updateCharCount() {
    const count = elements.textInput.value.length;
    elements.charCount.textContent = count;
    
    if (count > 4500) {
        elements.charCount.style.color = '#e53e3e';
    } else if (count > 4000) {
        elements.charCount.style.color = '#dd6b20';
    } else {
        elements.charCount.style.color = '#718096';
    }
}

function updateVoiceOptions() {
    const selectedLanguage = elements.languageSelect.value;
    const voices = voiceConfigs[selectedLanguage] || [];
    
    elements.voiceNameSelect.innerHTML = '';
    
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.gender}, ${voice.type})`;
        elements.voiceNameSelect.appendChild(option);
    });
}

function updateSpeedValue() {
    elements.speedValue.textContent = elements.speedControl.value;
}

function updatePitchValue() {
    elements.pitchValue.textContent = elements.pitchControl.value;
}

async function generateSpeech() {
    if (!ttsClient) {
        showStatus(elements.generationStatus, 'Please load credentials first', 'error');
        return;
    }

    const text = elements.textInput.value.trim();
    if (!text) {
        showStatus(elements.generationStatus, 'Please enter some text', 'error');
        return;
    }

    try {
        elements.generateSpeech.disabled = true;
        showStatus(elements.generationStatus, 'Generating speech...', 'loading');

        const request = {
            input: { text: text },
            voice: {
                languageCode: elements.languageSelect.value,
                name: elements.voiceNameSelect.value
            },
            audioConfig: {
                audioEncoding: elements.audioFormat.value,
                speakingRate: parseFloat(elements.speedControl.value),
                pitch: parseFloat(elements.pitchControl.value)
            }
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        currentAudioBuffer = response.audioContent;

        // Create audio blob and URL
        const audioBlob = new Blob([currentAudioBuffer], { 
            type: getAudioMimeType(elements.audioFormat.value) 
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Update audio player
        elements.audioPlayer.src = audioUrl;
        elements.audioPlayer.style.display = 'block';
        
        // Enable controls
        elements.playAudio.disabled = false;
        elements.saveAudio.disabled = false;

        // Show audio info
        updateAudioInfo(text, request);

        showStatus(elements.generationStatus, 'Speech generated successfully!', 'success');
    } catch (error) {
        showStatus(elements.generationStatus, `Error generating speech: ${error.message}`, 'error');
    } finally {
        elements.generateSpeech.disabled = false;
    }
}

function playAudio() {
    if (elements.audioPlayer.src) {
        elements.audioPlayer.play();
        elements.playAudio.disabled = true;
        elements.stopAudio.disabled = false;
    }
}

function stopAudio() {
    if (elements.audioPlayer.src) {
        elements.audioPlayer.pause();
        elements.audioPlayer.currentTime = 0;
        elements.playAudio.disabled = false;
        elements.stopAudio.disabled = true;
    }
}

async function saveAudio() {
    if (!currentAudioBuffer) {
        showStatus(elements.generationStatus, 'No audio to save', 'error');
        return;
    }

    try {
        const extension = elements.audioFormat.value.toLowerCase() === 'ogg_opus' ? 'ogg' : 
                          elements.audioFormat.value.toLowerCase();
        const filename = `speech_${Date.now()}.${extension}`;
        
        const result = await ipcRenderer.invoke('save-audio-file', currentAudioBuffer, filename);
        
        if (result.success) {
            showStatus(elements.generationStatus, `Audio saved to: ${result.path}`, 'success');
        } else {
            showStatus(elements.generationStatus, `Error saving audio: ${result.error}`, 'error');
        }
    } catch (error) {
        showStatus(elements.generationStatus, `Error saving audio: ${error.message}`, 'error');
    }
}

function getAudioMimeType(format) {
    switch (format) {
        case 'MP3':
            return 'audio/mpeg';
        case 'WAV':
            return 'audio/wav';
        case 'OGG_OPUS':
            return 'audio/ogg';
        default:
            return 'audio/mpeg';
    }
}

function updateAudioInfo(text, request) {
    const info = `
        <strong>Text Length:</strong> ${text.length} characters<br>
        <strong>Language:</strong> ${request.voice.languageCode}<br>
        <strong>Voice:</strong> ${request.voice.name}<br>
        <strong>Format:</strong> ${request.audioConfig.audioEncoding}<br>
        <strong>Speed:</strong> ${request.audioConfig.speakingRate}x<br>
        <strong>Pitch:</strong> ${request.audioConfig.pitch} semitones<br>
        <strong>Generated:</strong> ${new Date().toLocaleString()}
    `;
    elements.audioInfo.innerHTML = info;
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status ${type}`;
    
    if (type === 'loading') {
        element.classList.add('loading');
    } else {
        element.classList.remove('loading');
    }
}

// Initialize character count
updateCharCount();