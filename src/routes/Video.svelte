<script>
  import { onMount } from "svelte";

  export let src;           // video URL
  export let container;     // DOM element to watch scroll inside
  export let offset = 0;    // optional offset

  let video;
  let duration = 1;
  let scrollY = 0;

  $: if (container && video) {
    const rect = container.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top + offset;
    const sectionHeight = container.offsetHeight - window.innerHeight;
    const scrollFraction = Math.min(Math.max((window.scrollY - sectionTop) / sectionHeight, 0), 1);
    video.currentTime = duration * scrollFraction;
  }

  onMount(() => {
    if (video) {
      video.onloadedmetadata = () => {
        duration = video.duration;
      };
    }
  });
</script>

<svelte:window bind:scrollY />

<div class="video-wrapper">
  <video bind:this={video} muted preload="metadata" src={src}></video>
</div>

<style>
.video-wrapper {
  width: 100%;
  height: 500px; /* <-- only the height of this section */
  overflow: hidden;
  position: relative;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>