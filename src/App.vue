<template>
  <main class="p-2 flex flex-col items-center flex-grow justify-center w-full">
    <router-view />
  </main>

  <footer class="border-t-2 mt-10 w-full p-4 text-sm">
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    />
    <div id="socials" class="mb-4 flex justify-center gap-2">
      <!-- Twitter Share Button -->
      <a
        href="https://twitter.com/share?url=https://arabic-concordances.koljapluemer.com"
        target="_blank"
        rel="noopener"
      >
        <i class="fab fa-twitter share-icon"></i> Share on Twitter
      </a>

      <!-- Reddit Share Button -->
      <a
        href="https://www.reddit.com/submit?url=https://arabic-concordances.koljapluemer.com"
        target="_blank"
        rel="noopener"
      >
        <i class="fab fa-reddit share-icon"></i> Share on Reddit
      </a>

      <!-- Hacker News Share Button -->
      <a
        href="https://news.ycombinator.com/submitlink?u=https://arabic-concordances.koljapluemer.com"
        target="_blank"
        rel="noopener"
      >
        <i class="fab fa-hacker-news share-icon"></i> Share on Hacker News
      </a>
    </div>

    <ul class="flex flex-col gap-2">
      <li>
        This tool would not be possible without the used Arabic Corpora. I used:
        <ul class="list-disc list-inside pl-4">
          <li>
            The
            <a href="https://tatoeba.org/en/downloads" class="underline"
              >Tatoeba Sentence Download</a
            >.
          </li>
          <li>
            The
            <a
              href="https://github.com/linuxscout/tashkeela2"
              class="underline"
            >
              Tashkeela2 Corpus</a
            >
          </li>
        </ul>
      </li>
      <li>
        I ran experiments with:
        <ul class="list-disc list-inside pl-4">
          <li>
            <a
              href="https://app.memrise.com/course/463357/al-kitaab-unit-vocab/2/"
              class="underline"
              >This vocabulary list</a
            >
          </li>
          <li>
            <a
              href="http://www.modernstandardarabic.com/cognate-list-of-arabic-and-english-words/"
              class="underline"
              >This cognate list</a
            >
          </li>
        </ul>
      </li>
      <li>
        Made by
        <a class="underline" href="https://koljapluemer.com/"
          >Kolja Sam Pluemer</a
        >.
        <a href="mailto:feedback@koljapluemer.com" class="underline"
          >Mail me your feedback!</a
        >
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
        >,
        <a
          class="underline"
          href="https://basic-arabic-sentences.koljapluemer.com/"
          >Trainer for Egyptian Arabic Survival Sentences</a
        >, &
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
