<script>
  import { createEventDispatcher } from "svelte";
  import { tweened } from "svelte/motion";
  import { quartInOut } from "svelte/easing";

  export let size = 64;
  export let value;
  export let min = 0;
  export let max = 127;
  export let step = 1;

  // Amount of PX the mouse has to move to change the value from min to max
  export let sensitivity = 100;

  // Amount of PX the mouse has to move to change the value from min to max when shift is pressed (fine-tune)
  export let fineTuneSensitivity = 500;

  const dispatch = createEventDispatcher();

  let knob;
  let startY;
  let lastY;
  let startValue;

  let fineTune = false;
  let strokeWidth = tweened(8, {
    duration: 100,
    easing: quartInOut,
  });

  function calculateFactor(baseDistance) {
    return (max - min) / baseDistance;
  }

  function calculateRotation(value) {
    return ((value - min) / (max - min)) * 270 - 135;
  }

  function rotationToValue(distance, baseDistance) {
    const factor = calculateFactor(baseDistance);
    const rawValue = startValue - distance * factor;
    return Math.max(min, Math.min(max, rawValue));
  }

  function startDrag(event) {
    event.preventDefault();
    startY = event.clientY;
    lastY = startY;
    startValue = value;
    fineTune = event.shiftKey;
    strokeWidth.set(fineTune ? 4 : 8);

    function onMouseMove(moveEvent) {
      lastY = moveEvent.clientY;

      const distance = lastY - startY;
      let newValue = rotationToValue(distance, fineTune ? fineTuneSensitivity : sensitivity);
      if (step !== null) {
        newValue = Math.round(newValue / step) * step;
      }
      value = newValue;
      dispatch("input", { value });
    }

    function onKeyDown(event) {
      if (event.key === "Shift") {
        startY = lastY;
        startValue = value;
        fineTune = true;
        strokeWidth.set(4);
      }
    }

    function onKeyUp(event) {
      if (event.key === "Shift") {
        startY = lastY;
        startValue = value;
        fineTune = false;
        strokeWidth.set(8);
      }
    }

    function onMouseUp() {
      fineTune = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);

      dispatch("change", { value });
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onWheel(event) {
    event.preventDefault();
    event.stopPropagation();

    const factor = calculateFactor(event.shiftKey ? fineTuneSensitivity : sensitivity);
    const newValue = value + event.deltaY * factor;
    value = Math.max(min, Math.min(max, newValue));
    dispatch("input", { value });
  }

  function onKeyDown(event) {
    event.stopPropagation();

    // Assume the knob is focused, if it takes 100 px to go from min to max
    // it should take 10 "steps" to go from min to max with key presses
    const arrowKeySensitivity = event.shiftKey ? fineTuneSensitivity / 10 : sensitivity / 10;
    const factor = calculateFactor(arrowKeySensitivity);

    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      value = Math.min(max, value + step * factor);
      dispatch("input", { value });
    }

    if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      value = Math.min(max, value - step * factor);
      dispatch("input", { value });
    }
  }

  $: rotation = calculateRotation(value);
</script>

<div
  class="knob"
  style="--size: {size}px"
  on:mousedown={startDrag}
  on:keydown={onKeyDown}
  on:wheel={onWheel}
  bind:this={knob}
  role="slider"
  tabindex="0"
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuenow={value}
>
  <svg viewBox="0 0 100 100">
    <!-- Background arc -->
    <path
      class="gauge"
      d="M 30 70 A 30 30 0 1 1 70 70"
      stroke="#707271"
      stroke-linecap="round"
      stroke-width="8"
      fill="none"
    />

    <!-- Needle -->
    <line
      class="needle"
      x1="50"
      y1="50"
      x2="50"
      y2="20"
      stroke="#EBEBEB"
      stroke-width={$strokeWidth}
      stroke-linecap="round"
      transform="rotate({rotation} 50 50)"
    />
  </svg>
</div>

<style>
  .knob {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    border-radius: 55%;
  }

  .knob:focus-visible {
    outline: none;
    background-color: rgba(255, 255, 255, 0.05);
  }

  svg {
    width: var(--size);
    height: var(--size);
  }
</style>
