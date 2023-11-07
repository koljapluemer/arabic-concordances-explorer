<script setup>
import { ref, watch, computed, onMounted } from "vue";

const currentlyPracticedSentence = ref(null);

const explorationBreadcrumbs = ref([]);

// if uid is not in localStorage, create one and save
let uid;
if (localStorage.getItem("uid")) {
  uid = localStorage.getItem("uid");
} else {
  uid = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("uid", uid);
}

const sentencesNotes = ref({});
// load sentencesNotes from localStorage (if they exist there)
if (localStorage.getItem("sentencesNotes")) {
  sentencesNotes.value = JSON.parse(localStorage.getItem("sentencesNotes"));
}

// deep watcher for sentencesNotes, saving to JSON
watch(
  sentencesNotes,
  () => {
    localStorage.setItem(
      "sentencesNotes",
      JSON.stringify(sentencesNotes.value)
    );
  },
  { deep: true }
);

const sentencesTranslations = ref({});
// load sentencesTranslations from localStorage (if they exist there)
if (localStorage.getItem("sentencesTranslations")) {
  sentencesTranslations.value = JSON.parse(
    localStorage.getItem("sentencesTranslations")
  );
}

// deep watcher for sentencesTranslations, saving to JSON
watch(
  sentencesTranslations,
  () => {
    localStorage.setItem(
      "sentencesTranslations",
      JSON.stringify(sentencesTranslations.value)
    );
  },
  { deep: true }
);


import corpusData from "@/corpus1.json";
const initialCorpusSentences = corpusData["sentences"];

// add data from ara_sentences.json
import corpusData2 from "@/ara_sentences.json";
const initialCorpusSentences2 = corpusData2["sentences"];
initialCorpusSentences.push(...initialCorpusSentences2);

const relevantCorpusSentences = ref([]);

import cognatesData from "@/cognates.json";
const cognates = cognatesData["cognates"];
// get easy sentences: at most 6 words at least 3 words, and at least 1 cognate
const easySentences = initialCorpusSentences.filter(
  (sentence) =>
    splitSentence(sentence).length < 12 &&
    splitSentence(sentence).length > 3 &&
    splitSentence(sentence).some((word) => cognates.includes(word))
);

// get sentences that are both easy and have a word from vocab.json
import vocabData from "@/words.json";
const vocab = vocabData["words"];

// make a list of obj to track stats for each vocab word
// check if its in localStorage, if not, create it
let vocabStats = [];
if (localStorage.getItem("vocabStats")) {
  vocabStats = JSON.parse(localStorage.getItem("vocabStats"));
} else {
  for (const word of vocab) {
    vocabStats.push({
      word: word,
      stats: [],
    });
  }
  localStorage.setItem("vocabStats", JSON.stringify(vocabStats));
}

const allVocabSentences = initialCorpusSentences.filter(
  (sentence) =>
    splitSentence(sentence).some((word) => vocab.includes(word)) &&
    splitSentence(sentence).length < 7
);

const initialCorpusSentence = ref(null);

function getNewSentence() {
  
  const unpracticedSentences = allVocabSentences.filter(
    (sentence) => !sentencesTranslations.value[sentence]
  );
  initialCorpusSentence.value =
    unpracticedSentences[
      Math.floor(Math.random() * unpracticedSentences.length)
    ];

  // if sentencesTranslations[initialCorpusSentence] does not exist, create it

  if (!sentencesTranslations.value[initialCorpusSentence.value]) {
    sentencesTranslations.value[initialCorpusSentence.value] = "";
  }
}

getNewSentence();

const exploredWord = ref(null);
function exploreWord(word) {
  explorationBreadcrumbs.value.push(word);
  exploredWord.value = word;
  // try first to find corpus sentences with the word that have less than 6 words
  let sentenceCandidates = initialCorpusSentences.filter(
    (sentence) =>
      sentence.includes(word) &&
      splitSentence(sentence).length < 6 &&
      sentence !== initialCorpusSentence.value
  );
  // add as many sentences as needed to have 3 relevant sentences (length does not matter, but they must include the word)
  // but catch the possibility that there are not enough sentences in the corpus
  const sentencesIncludingTheWord = initialCorpusSentences.filter(
    (sentence) =>
      sentence.includes(word) &&
      !sentenceCandidates.includes(sentence) &&
      sentence !== initialCorpusSentence.value &&
      splitSentence(sentence).length < 35
  );
  sentenceCandidates = sentenceCandidates.concat(
    sentencesIncludingTheWord.slice(
      0,
      3 - sentenceCandidates.length > 0 ? 3 - sentenceCandidates.length : 0
    )
  );
  relevantCorpusSentences.value = sentenceCandidates.slice(0, 3);
  // try to find a sentence (below 35 words) that is not included so far, and matches the word - exactly -
  // this is to prevent a case where short words generate only fake concordance, where their letters are included in other words
  // catch possibility that there is no such sentence
  const exactSentence = initialCorpusSentences.find(
    (sentence) =>
      sentence.includes(word) &&
      !sentenceCandidates.includes(sentence) &&
      sentence !== initialCorpusSentence.value &&
      splitSentence(sentence).length < 35
  );
  if (exactSentence) {
    relevantCorpusSentences.value.push(exactSentence);
  }
}


function splitSentence(sentence) {
  if (!sentence) return [];
  return sentence.split(" ");
}
</script>

<template>
  <div
    class="card bg-gray-600 shadow-xl my-4 p-4 flex flex-col justify-start items-center w-full max-w-screen-2xl"
    style="min-height: 390px"
  >
    <div class="w-full" v-if="!exploredWord">
      <h2 class="font-bold text-center text-2xl">
        Try to translate this sentence:
      </h2>
      <h3 class="text-center mb-6">Click on a word to explore.</h3>
      <div class="flex gap-2 flex-wrap flex-row-reverse justify-center">
        <div
          class="cursor-pointer text-4xl hover:bg-yellow-300"
          dir="rtl"
          v-for="word in splitSentence(initialCorpusSentence)"
          @click="exploreWord(word)"
        >
          {{ word }}
        </div>
      </div>

      <div class="form-control my-4">
        <label class="input-group">
          <span>Your translation attempt</span>
          <input
            type="text"
            placeholder="..."
            class="input input-bordered w-full"
            v-model="sentencesTranslations[initialCorpusSentence]"
          />
        </label>
      </div>
      <div class="form-control my-4">
        <label class="input-group">
          <span>Notes</span>
          <textarea
            placeholder="..."
            class="textarea input-bordered w-full"
            rows="7"
            v-model="sentencesNotes[initialCorpusSentence]"
          ></textarea>
        </label>
      </div>
      <div class="flex gap-2">
        <!-- translation for the sentence, only enabled when translation attempt has at least as many words as the arabic sentence -->
        <a
          target="_blank"
          class="btn"
          :href="`https://translate.google.com/?sl=ar&tl=en&text=${initialCorpusSentence}&op=translate`"
          :class="
            splitSentence(initialCorpusSentence).length - 2 <=
              splitSentence(sentencesTranslations[initialCorpusSentence])
                .length &&
            sentencesTranslations[initialCorpusSentence].length > 3
              ? ''
              : 'btn-disabled'
          "
        >
          <span> Check Translation</span>
          <svg
            class="w-8 h-8"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </a>
        <!-- button to get new sentence, same conditions -->
        <button
          class="btn"
          :class="
            splitSentence(initialCorpusSentence).length - 2 <=
              splitSentence(sentencesTranslations[initialCorpusSentence])
                .length &&
            sentencesTranslations[initialCorpusSentence].length > 3
              ? ''
              : 'btn-disabled'
          "
          @click="getNewSentence()"
        >
          Get Next Sentence
        </button>
      </div>
    </div>
    <div v-else>
      <div class="flex flex-col">
        <div class="p-2 mb-5 flex gap-5 items-center flex-row">
          <div class="">
            exploring:
            <span class="text-3xl">{{ exploredWord }}</span>
          </div>

          <button
            class="btn btn-sm text-sm"
            @click="
              explorationBreadcrumbs = [];
              exploredWord = null;
            "
          >
            Back to main sentence
          </button>
        </div>

        <div class="text-sm breadcrumbs border-b border-t mb-4">
          <ul>
            <li
              class="cursor-pointer"
              @click="
                explorationBreadcrumbs = [];
                exploredWord = null;
              "
            >
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                class="w-4 h-4 mr-2 stroke-current"
                stroke-width="1.5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              {{ initialCorpusSentence.substring(0, 40) }}
              <span v-if="initialCorpusSentence.length > 40">...</span>
            </li>
            <li
              v-for="breadcrumb in explorationBreadcrumbs"
              @click="exploreWord(breadcrumb)"
              class="cursor-pointer"
            >
              {{ breadcrumb }}
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div
          class="p-4 bg-gray-700 rounded-lg"
          v-for="sentence in relevantCorpusSentences"
        >
          <div class="flex gap-4 p-2 justify-between items-center">
            <!-- mark word (text marker background effect) in sentence is tis the exploredWord -->
            <div class="flex gap-2 flex-wrap flex-row-reverse">
              <div
                class="cursor-pointer text-2xl"
                :class="word.includes(exploredWord) ? 'bg-yellow-300' : ''"
                v-for="word in splitSentence(sentence)"
                @click="exploreWord(word)"
                dir="rtl"
              >
                {{ word }}
              </div>
            </div>

            <a
              target="_blank"
              class=""
              :href="`https://translate.google.com/?sl=ar&tl=en&text=${sentence}&op=translate`"
            >
              <svg
                class="btn btn-sm"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </a>
          </div>

          <textarea
            type="text"
            class="p-2 rounded w-full"
            placeholder="your sentence notes..."
            v-model="sentencesNotes[sentence]"
          >
          </textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fill-button {
  background: linear-gradient(to right, #641ae6 50%, transparent 0);
  background-size: 200% 100%;
  background-position: right;
  animation: makeItfadeIn 5s 0s forwards linear;
}

@keyframes makeItfadeIn {
  100% {
    background-position: left;
  }
}

.countdown-timer {
  text-align: center;
}

.progress-bar {
  width: 100%;
  background-color: #ccc;
  height: 20px;
  position: relative;
  border-radius: 12px;
}

.progress-bar div {
  height: 100%;
  background-color: #4caf50;
  transition: width 1s linear;
}
</style>
