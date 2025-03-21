import { writable } from "svelte/store";
import { audioManager } from "./audio.js";

export const detuneAmount = writable(20);
export const reverbTime = writable(2);
export const reverbAmount = writable(0.25);
export const distortionAmount = writable(4);
export const cutoff = writable(20000);
export const numOsc = writable(8);

export const adsr = writable({
  attack: 0.01,
  decay: 0.08,
  sustain: 0.3,
  release: 1.1,
});

detuneAmount.subscribe((value) => (audioManager.getInstrument("supersaw").detuneAmount = value));
reverbTime.subscribe((value) => audioManager.getInstrument("supersaw").reverb.setTime(value));
reverbAmount.subscribe((value) =>
  audioManager
    .getInstrument("supersaw")
    .reverbControl.getNode()
    .gain.setValueAtTime(value, audioManager.audioContext.currentTime),
);
distortionAmount.subscribe((value) => audioManager.getInstrument("supersaw").dryDistortion.setAmount(value));
numOsc.subscribe((value) => (audioManager.getInstrument("supersaw").numOscillators = value));
cutoff.subscribe((value) =>
  audioManager
    .getInstrument("supersaw")
    .cutoffFilter.filter.frequency.setValueAtTime(value, audioManager.audioContext.currentTime),
);

adsr.subscribe((params) => {
  const instrument = audioManager.getInstrument("supersaw");

  instrument.adsr.attack = params.attack;
  instrument.adsr.decay = params.decay;
  instrument.adsr.sustain = params.sustain;
  instrument.adsr.release = params.release;
});
