<script setup>
import { ref, watch, computed, onMounted } from "vue";
// import { supabase } from "@/lib/supabaseClient";
import { createToaster } from "@meforma/vue-toaster";

const toaster = createToaster({
  position: "top-right",
});

const exercise = ref(null);
const lastExercise = ref(null);
const exercisesDoneThisSession = ref(0);
const practiceExercisesDoneThisSession = ref(0);
const streak = ref(0);
const incorrectAnswerCounter = ref(0);
const isRevealed = ref(false);
const lastAnswerWasCorrect = ref(false);

const gameMode = ref("undetermined");
const currentlyPracticedSentence = ref(null);

const countingDown = ref(false);
const countdown = ref(3);

const score = ref(0);
const lastScore = ref(null);

const timeoutId = ref(null);

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
// if (localStorage.getItem("sentencesTranslations")) {
//   sentencesTranslations.value = JSON.parse(
//     localStorage.getItem("sentencesTranslations")
//   );
// }

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

// EXERCISES IMPORTER FROM BACKEND
let exercises = [];
// import data from "@/clozes.json";

// for (const exercise of data["exercises"]) {
//   exercise.sr = {
//     repetitions: 0,
//     interval: 10,
//     due: Math.floor(new Date().getTime() / 1000),
//   };
//   exercise.practiceBucket = 0;
//   exercise.stats = [];
//   exercises.push(exercise);
// }

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
import vocabData from "@/vocab.json";
const vocab = vocabData["words"];

const allVocabSentences = initialCorpusSentences.filter(
  (sentence) =>
    splitSentence(sentence).some((word) => vocab.includes(word)) &&
    splitSentence(sentence).length < 15
);
console.log(`overall found ${allVocabSentences.length} sentences with vocab`);

const initialCorpusSentence = ref(null);

function getNewSentence() {
  const unpracticedSentences = allVocabSentences.filter(
    (sentence) => !sentencesTranslations.value[sentence]
  );
  initialCorpusSentence.value =
    unpracticedSentences[
      Math.floor(Math.random() * unpracticedSentences.length)
    ];

  console.log(`new sentence: ${initialCorpusSentence.value}`);
  console.log(
    `sentencesTranslations: ${JSON.stringify(sentencesTranslations.value)}`
  );
  // if sentencesTranslations[initialCorpusSentence] does not exist, create it

  if (!sentencesTranslations.value[initialCorpusSentence.value]) {
    sentencesTranslations.value[initialCorpusSentence.value] = "";
  }
}

getNewSentence();

const exploredWord = ref(null);
function exploreWord(word) {
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

// async function translateRandomWord() {
//   // pick any word from the current relevantCorpusSentences
//   const randomCurrentSentence = relevantCorpusSentences.value[
//     Math.floor(Math.random() * relevantCorpusSentences.value.length)
//   ];
//   const randomWord = splitSentence(randomCurrentSentence)[
//     Math.floor(Math.random() * splitSentence(randomCurrentSentence).length)
//   ];
//   const res = await fetch("https://libretranslate.com/translate", {
// 	method: "POST",
// 	body: JSON.stringify({
// 		q: randomWord,
// 		source: "ar",
// 		target: "en",
// 		format: "text",
// 		api_key: ""
// 	}),
// 	headers: { "Content-Type": "application/json" }
// });

// console.log(await res.json());
// }

async function sendDataToBackend(statsObj) {
  // try {
  //   const { data, error } = await supabase
  //     .from("learning_data_cloze_sentences")
  //     .insert([
  //       {
  //         user_uid: uid,
  //         learning_result: JSON.stringify(statsObj),
  //       },
  //     ]);
  // } catch (error) {
  //   console.error(error);
  // }
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
      <h2 class="font-bold text-center text-2xl mb-2">
        Try to translate this sentence:
      </h2>
      <div class="flex gap-2 flex-wrap flex-row-reverse justify-center">
        <div
          class="cursor-pointer text-3xl"
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
            splitSentence(initialCorpusSentence).length > 3 &&
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
      <div class="border-b-2 p-2 mb-5 flex gap-5 items-center">
        <div class="">
          exploring:
          <span class="text-3xl">{{ exploredWord }}</span>
        </div>
        <button class="btn btn-sm text-sm" @click="exploredWord = null">
          Back to sentence
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <div
          class="p-4"
          v-for="sentence in relevantCorpusSentences"
          :class="
            relevantCorpusSentences.indexOf(sentence) % 2 == 0
              ? 'bg-gray-700'
              : ''
          "
        >
          <div class="flex gap-4 p-2 justify-between items-center">
            <!-- mark word (text marker background effect) in sentence is tis the exploredWord -->
            <div class="flex gap-2 flex-wrap flex-row-reverse">
              <div
                class="cursor-pointer text-2xl"
                :class="word.includes(exploredWord) ? 'bg-yellow-300' : ''"
                v-for="word in splitSentence(sentence)"
                @click="exploreWord(word)"
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

          <input
            type="text"
            class="p-2 rounded w-full"
            placeholder="your sentence notes..."
            v-model="sentencesNotes[sentence]"
          />
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
