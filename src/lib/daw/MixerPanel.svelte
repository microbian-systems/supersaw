<script>
  import { tweened } from "svelte/motion";
  import { quartInOut } from "svelte/easing";
  import ChannelStrip from "./ChannelStrip.svelte";
  import { isMixerOpen, tracks } from "../../core/store.js";
  import Knob from "../ui/Knob.svelte";
  import {
    adsr,
    cutoff,
    detuneAmount,
    distortionAmount,
    numOsc,
    reverbAmount,
    reverbTime,
  } from "../../core/instrument.js";
  import ADSR from "../ui/ADSR.svelte";
  import { audioManager } from "../../core/audio.js";

  const openHeight = 350;
  const closedHeight = 0;

  const mixerHeight = tweened($isMixerOpen ? openHeight : closedHeight, {
    duration: 100,
    easing: quartInOut,
  });

  function toggleMixer() {
    $isMixerOpen = !$isMixerOpen;
    mixerHeight.set($isMixerOpen ? openHeight : closedHeight);
  }

  let startY;
  let startHeight;

  function startResizing(event) {
    startY = event.clientY;
    mixerHeight.subscribe((value) => (startHeight = value))();
    window.addEventListener("mousemove", doResize);
    window.addEventListener("mouseup", stopResizing);
  }

  function doResize(event) {
    const newY = event.clientY;
    const newHeight = startHeight - (newY - startY);
    mixerHeight.set(newHeight > closedHeight ? newHeight : closedHeight);
  }

  function stopResizing() {
    window.removeEventListener("mousemove", doResize);
    window.removeEventListener("mouseup", stopResizing);
  }

  function handleKeyup(event) {
    if (event.key === "m") {
      toggleMixer();
    }
  }
</script>

<svelte:window on:keyup={handleKeyup} />

<div class="mixer-panel relative" style:height="{$mixerHeight}px">
  <div class="absolute -top-8">
    <button class="block h-8 w-auto rounded-tr bg-[#2D2D30] px-4 text-sm text-white" on:click={toggleMixer}>
      Mixer
    </button>
  </div>
  <div aria-hidden="true" class="h-1 w-full cursor-row-resize bg-[#2D2D30]" on:mousedown={startResizing}></div>
  <div class="flex h-full flex-row bg-[#2D2D30] p-1">
    <div class="flex flex-row gap-px bg-black p-px">
      <ChannelStrip label="Master" channel="master" />

      {#each $tracks.filter((track) => track.channel) as track}
        <ChannelStrip label={track.name} channel={track.id} />
      {/each}
    </div>

    <div class="mx-6 grid grid-cols-4 gap-3">
      <div class="flex flex-col">
        <span class="text-center text-xs">numOsc</span>
        <Knob bind:value={$numOsc} min={1} max={12} />
        <span class="text-center text-xs">{$numOsc.toFixed(2)}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-center text-xs">cutoff</span>
        <Knob bind:value={$cutoff} min={0} max={22000} />
        <span class="text-center text-xs">{$cutoff.toFixed(2)}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-center text-xs">reverbAmount</span>
        <Knob bind:value={$reverbAmount} min={0} max={1} step="0.01" />
        <span class="text-center text-xs">{$reverbAmount.toFixed(2)}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-center text-xs">reverbTime</span>
        <Knob bind:value={$reverbTime} max={10} step={0.1} />
        <span class="text-center text-xs">{$reverbTime.toFixed(2)}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-center text-xs">detuneAmount</span>
        <Knob bind:value={$detuneAmount} min={1} max={50} />
        <span class="text-center text-xs">{$detuneAmount.toFixed(2)}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-center text-xs">distortionAmount</span>
        <Knob bind:value={$distortionAmount} max={20} />
        <span class="text-center text-xs">{$distortionAmount.toFixed(2)}</span>
      </div>
    </div>
    <div class=" w-full max-w-lg">
      <ADSR
        bind:attack={$adsr.attack}
        bind:decay={$adsr.decay}
        bind:sustain={$adsr.sustain}
        bind:release={$adsr.release}
      />
    </div>
  </div>
</div>

<style>
  .mixer-panel {
    overflow: visible;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }
</style>
