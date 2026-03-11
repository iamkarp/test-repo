import librosa
import numpy as np
import torch
import torchaudio


def load_audio(filepath, sr=32000, duration=5, offset=0.0):
    """Load an audio file and resample to target sample rate."""
    audio, orig_sr = torchaudio.load(filepath)
    # Convert to mono if stereo
    if audio.shape[0] > 1:
        audio = audio.mean(dim=0, keepdim=True)
    # Resample if needed
    if orig_sr != sr:
        resampler = torchaudio.transforms.Resample(orig_sr, sr)
        audio = resampler(audio)
    # Trim or pad to target duration
    target_len = int(sr * duration)
    if offset > 0:
        offset_samples = int(sr * offset)
        audio = audio[:, offset_samples:]
    if audio.shape[1] > target_len:
        audio = audio[:, :target_len]
    elif audio.shape[1] < target_len:
        pad_len = target_len - audio.shape[1]
        audio = torch.nn.functional.pad(audio, (0, pad_len))
    return audio.squeeze(0)  # (num_samples,)


def audio_to_melspec(audio, sr=32000, n_mels=128, n_fft=1024, hop_length=320,
                     fmin=20, fmax=16000):
    """Convert audio waveform to mel spectrogram."""
    mel_transform = torchaudio.transforms.MelSpectrogram(
        sample_rate=sr,
        n_fft=n_fft,
        hop_length=hop_length,
        n_mels=n_mels,
        f_min=fmin,
        f_max=fmax,
        power=2.0,
    )
    mel_spec = mel_transform(audio.unsqueeze(0))
    # Convert to log scale
    mel_spec = torch.log(mel_spec.clamp(min=1e-10))
    # Normalize
    mel_spec = (mel_spec - mel_spec.mean()) / (mel_spec.std() + 1e-6)
    return mel_spec  # (1, n_mels, time)


def apply_time_mask(spec, max_mask=60):
    """Apply time masking augmentation to a spectrogram."""
    _, _, time_steps = spec.shape
    mask_len = np.random.randint(0, min(max_mask, time_steps))
    start = np.random.randint(0, max(1, time_steps - mask_len))
    spec[:, :, start:start + mask_len] = 0
    return spec


def apply_freq_mask(spec, max_mask=24):
    """Apply frequency masking augmentation to a spectrogram."""
    _, n_mels, _ = spec.shape
    mask_len = np.random.randint(0, min(max_mask, n_mels))
    start = np.random.randint(0, max(1, n_mels - mask_len))
    spec[:, start:start + mask_len, :] = 0
    return spec


def apply_mixup(spec1, label1, spec2, label2, alpha=0.5):
    """Apply mixup augmentation between two spectrograms."""
    lam = np.random.beta(alpha, alpha)
    mixed_spec = lam * spec1 + (1 - lam) * spec2
    mixed_label = lam * label1 + (1 - lam) * label2
    return mixed_spec, mixed_label
