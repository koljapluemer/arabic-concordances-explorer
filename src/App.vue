<script setup lang="ts">
import GameView from '@/views/Game.vue'
</script>

<template>
  <main class="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col items-center p-2">
    <GameView />
  </main>

  <footer class="mt-10 w-full border-t-2 p-4 text-sm">
    <ul class="flex flex-col gap-2">
      <li>
        This tool would not be possible without the used Arabic Corpora. I used:
        <ul class="list-inside list-disc pl-4">
          <li>
            The
            <a href="https://tatoeba.org/en/downloads" class="underline">Tatoeba Sentence Download</a>.
          </li>
          <li>
            The
            <a href="https://github.com/linuxscout/tashkeela2" class="underline">Tashkeela2 Corpus</a>
          </li>
        </ul>
      </li>
      <li>
        Made by
        <a class="underline" href="https://koljasam.com/">Kolja Sam</a>. If you enjoy this tool, you can <a
          href="https://ko-fi.com/S6S81CWUVD" target="_blank" rel="noopener" class="link">
          buy me a coffee
        </a>.
      </li>
      <li>

      </li>
    </ul>
  </footer>
</template>
