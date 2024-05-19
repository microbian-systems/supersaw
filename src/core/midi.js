import * as midiManager from "midi-file";
import { bpm, changeBpm } from "./store.js";
import { get } from "svelte/store";

export async function createMidiClipFromUrl(url, clipName = "unnamed") {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const parsed = midiManager.parseMidi(data);

  // Create a new clip
  const clip = {
    id: crypto.randomUUID(),
    type: "midi",
    name: clipName,
    startTime: 0,
    duration: getDurationFromMidi(parsed),
    midiData: parsed,
  };

  return clip;
}

export async function createMidiClipFromFile(file) {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const parsed = midiManager.parseMidi(data);

  // Create a new clip
  const clip = {
    id: crypto.randomUUID(),
    name: file.name,
    startTime: 0,
    duration: getDurationFromMidi(parsed),
    midiData: parsed,
    type: "midi",
  };

  return clip;
}

function ticksToMilliseconds(ticks, ticksPerBeat, bpm) {
  return (ticks / ticksPerBeat) * (60000 / bpm);
}

function getDurationFromMidi(parsed) {
  let highestTime = 0;

  parsed.tracks.forEach((track) => {
    let wallTime = 0;

    track.forEach((event) => {
      wallTime += event.deltaTime;

      if (wallTime > highestTime) {
        highestTime = wallTime;
      }
    });
  });

  return ticksToMilliseconds(highestTime, parsed.header.ticksPerBeat, get(bpm)) / 1000;
}

function getNoteLabel(noteNumber) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(noteNumber / 12) - 1;
  return `${noteNames[noteNumber % 12]}${octave}`;
}

export async function parseMidiFile(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const parsed = midiManager.parseMidi(data);

  let highestTime = 0;
  let notes = [];

  parsed.tracks.forEach((track) => {
    let wallTime = 0;
    let wallTimeInMilliseconds = 0;

    let trackName = track.find((event) => event.type === "trackName")?.text || "Unnamed";

    track.forEach((event) => {
      // Timing
      wallTime += event.deltaTime;
      wallTimeInMilliseconds = ticksToMilliseconds(wallTime, ticksPerBeat, $bpm);

      if (event.type === "setTempo") {
        let newBpm = 60000000 / event.microsecondsPerBeat;
        changeBpm(Math.floor(newBpm));
      }

      if (event.type === "noteOn") {
        notes.push({
          track: trackName,
          note: event.noteNumber,
          label: getNoteLabel(event.noteNumber),
          velocity: event.velocity,
          start: wallTimeInMilliseconds,
          tickOffset: wallTime,
          duration: 0, // will be changed later
        });
      }

      if (event.type === "noteOff") {
        let note = notes

          .filter((note) => note.start < wallTimeInMilliseconds && note.duration === 0)
          .find((note) => note.note === event.noteNumber);

        note.duration = wallTimeInMilliseconds - note?.start;
      }
    });

    if (wallTime > highestTime) {
      highestTime = wallTime;
    }
  });

  return notes;
}

export function renderMidiToSvg(midiData) {
  let highestTime = 0;
  let notes = [];

  midiData.tracks.forEach((track) => {
    let wallTime = 0;
    let wallTimeInMilliseconds = 0;

    track.forEach((event) => {
      wallTime += event.deltaTime;
      wallTimeInMilliseconds = ticksToMilliseconds(wallTime, midiData.header.ticksPerBeat, get(bpm));

      if (event.type === "noteOn") {
        notes.push({
          note: event.noteNumber,
          velocity: event.velocity,
          start: wallTimeInMilliseconds,
          tickOffset: wallTime,
          duration: 0, // will be changed later
        });
      }

      if (event.type === "noteOff") {
        let note = notes
          .filter((note) => note.start < wallTimeInMilliseconds && note.duration === 0)
          .find((note) => note.note === event.noteNumber);

        if (note) {
          note.duration = wallTimeInMilliseconds - note?.start;
        }
      }
    });

    if (wallTime > highestTime) {
      highestTime = wallTime;
    }
  });

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" viewBox="0 0 1000 100" preserveAspectRatio="none" >`;

  notes.forEach((note) => {
    svg += `<rect x="${note.start}" y="${note.note}" width="${note.duration}" height="3" fill="currentColor" />`;
  });

  svg += `</svg>`;

  return svg;
}
