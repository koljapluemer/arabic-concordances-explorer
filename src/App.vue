<script setup>
import Game from "./components/Game.vue";
</script>

<template>
  <main class="p-2 flex flex-col items-center flex-grow justify-center">

  <Game />
  </main>

  <footer class="border-t-2 mt-10 w-full p-4 text-sm">
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    />
    <div id="socials" class="mb-4 flex justify-center gap-2">
      <!-- Twitter Share Button -->
      <a
        href="https://twitter.com/share?url=https://basic-arabic-sentences.koljapluemer.com"
        target="_blank"
        rel="noopener"
      >
        <i class="fab fa-twitter share-icon"></i> Share on Twitter
      </a>

      <!-- Reddit Share Button -->
      <a
        href="https://www.reddit.com/submit?url=https://basic-arabic-sentences.koljapluemer.com"
        target="_blank"
        rel="noopener"
      >
        <i class="fab fa-reddit share-icon"></i> Share on Reddit
      </a>

      <!-- Hacker News Share Button -->
      <a
        href="https://news.ycombinator.com/submitlink?u=https://basic-arabic-sentences.koljapluemer.com"
        target="_blank"
        rel="noopener"
      >
        <i class="fab fa-hacker-news share-icon"></i> Share on Hacker News
      </a>
    </div>

    <ul class="flex flex-col gap-2">
      <li>
        Thanks to all the friends who provided content & feedback. Furthermore, I
        used the following sources for inspiration and exercise templates:
        <a
          href="https://discoverdiscomfort.com/colloquial-egyptian-arabic-phrases/"
          >[0]</a
        >
        <a
          href="https://storylearning.com/learn/arabic/arabic-tips/arabic-phrases"
          >[1]</a
        >
        <a href="https://talkinarabic.com/egyptian/arabic-phrases/">[2]</a>
      </li>
      <li>
        Made by
        <a class="underline" href="https://koljapluemer.com/">Kolja Sam Pluemer</a
        >. <a href="mailto:feedback@koljapluemer.com" class="underline">Mail me your feedback!</a>  
      </li>
      <li>
        Pseudonymous learning is transmitted to improve the app. No personal
        data leaves your device. Cookies are used to store your progress, but
        they are not of the privacy-invading sort.
      </li>
      <li>
        you may also enjoy:
        <a
          class="underline"
          href="https://arabic-pronounciation.koljapluemer.com/"
          >Arabic Pronunciation Tutor (WIP)</a
        >
        &
        <a class="underline" href="https://arabic-numbers.koljapluemer.com/"
          >Arabic Number Practice</a
        >.
      </li>
      <li>
        More cool stuff at
        <a class="underline" href="https://koljapluemer.com/"
          >koljapluemer.com</a
        >.
      </li>
    </ul>
  </footer>
</template>
