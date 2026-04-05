<script>
  import { onMount } from "svelte";
  import { initChart } from "$lib/chart.js";
import ScrollyVideo from 'scrolly-video/dist/ScrollyVideo.svelte';

  let chartContainer;
  let landingContainer; 
  let endingContainer; 
  let contentContainer; 
  let videoContainer;
  let chartProgress;
  let videoProgress;
  let progress2;
let chart;

onMount(() => {
  chart = initChart(chartContainer);
      const updateVideo = () => {
      if (scrollyVideoRef) {
        const duration = scrollyVideoRef.duration || 1;
        const targetTime = videoProgress * duration;
        // Only update if difference is noticeable
        if (Math.abs(scrollyVideoRef.currentTime - targetTime) > 0.01) {
          scrollyVideoRef.currentTime = targetTime;
        }
      }
      requestAnimationFrame(updateVideo);
    };
    requestAnimationFrame(updateVideo);

});
  $: if (chart && chartProgress !== undefined) {
  chart.update(chartProgress);
}
  let scrollyVideoRef;
$: if (scrollyVideoRef && videoProgress !== undefined) {
  scrollyVideoRef.currentTime = (scrollyVideoRef.duration || 1) * videoProgress;
}
  function onReady() {
    console.log("Video ready to scroll!");
  }

  function onChange(percentage) {
    console.log("Scroll percentage:", percentage);
  }

  onMount(() => {
    // Force initial sizing if needed
    if (scrollyVideoRef) {
      scrollyVideoRef.updateSizes?.();
    }
  });

  import Scroller from '@sveltejs/svelte-scroller';

  let index, offset, progress;

</script>

<Scroller top="{0.2}" bottom="{0.8}" bind:index bind:offset bind:progress>
  <div slot="background">
  <h1>Content 1</h1>

    <p>
      This is the background content. It will stay fixed in place while the
      foreground scrolls over the top.
    </p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

    <p>Section {index + 1} is currently active.</p>
  </div>

  <div slot="foreground">
    <section>This is the first section.</section>
    <section>This is the second section.</section>
    <section>This is the third section.</section>
  </div>
</Scroller>


<Scroller top="{0}" bottom="{1}" bind:index bind:offset bind:progress={chartProgress}>
  <div slot="background">
  <h1>Content 2</h1>
  <div bind:this={chartContainer} class="chart-sticky-wrapper" style="height: 200vh">
    <div class="chart-top-content">
      <h2>Chart Title or Description</h2>
      <p>This content sticks with the chart while scrolling.</p>
    </div>

    <div class="chart-sticky">
      <!-- D3 will append SVG here -->
    </div>
  </div>
    <p>Section {index + 1} is currently active.</p>
  </div>

  <div slot="foreground">
    <section>This is the first section.</section>
    <section>This is the second section.</section>
    <section>This is the third section.</section>
  </div>
</Scroller>

<div class="video-container">
  <ScrollyVideo
    bind:this={scrollyVideoRef}
    src="/videos/loading.mov"
    sticky={true}
    full={true}
    trackScroll={true}
    start={0}
    end={1}
    onReady={onReady}
    onChange={onChange}
  />
    <div class="foreground">
    <section>Video Section 1</section>
    <section>Video Section 2</section>
    <section>Video Section 3</section>
  </div>
</div>


<Scroller top="{0.2}" bottom="{0.8}" bind:index bind:offset bind:progress={progress2}>
  <div slot="background">
  <h1>Content 4</h1>

    <p>Section {index + 1} is currently active.</p>
  </div>

  <div slot="foreground">
    <section>This is the first section.</section>
    <section>This is the second section.</section>
    <section>This is the third section.</section>
  </div>
</Scroller>
