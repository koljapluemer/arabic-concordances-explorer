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

const initialCorpusSentence = ref(null);
initialCorpusSentence.value =
  initialCorpusSentences[
    Math.floor(Math.random() * initialCorpusSentences.length)
  ];

const relevantCorpusSentences = ref([]);

const exploredWord = ref(null);
function exploreWord(word) {
  exploredWord.value = word;
  // try first to find corpus sentences with the word that have less than 6 words
  let sentenceCandidates = initialCorpusSentences.filter(
    (sentence) => sentence.includes(word) && splitSentence(sentence).length < 6
  );
  // add as many sentences as needed to have 3 relevant sentences (length does not matter, but they must include the word)
  // but catch the possibility that there are not enough sentences in the corpus
  const sentencesIncludingTheWord = initialCorpusSentences.filter((sentence) =>
    sentence.includes(word) && !sentenceCandidates.includes(sentence)
  );
  sentenceCandidates = sentenceCandidates.concat(
    sentencesIncludingTheWord.slice(
      0,
      3 - sentenceCandidates.length > 0 ? 3 - sentenceCandidates.length : 0
    )
  );
  relevantCorpusSentences.value = sentenceCandidates.slice(0, 3);
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
  return sentence.split(" ");
}
</script>

<template>
  <div
    class="card bg-gray-600 shadow-xl my-4 p-4 flex flex-col justify-start items-center w-full max-w-screen-xl"
    style="min-height: 390px"
  >
    <div class="flex gap-2 flex-wrap flex-row-reverse" v-if="!exploredWord">
      <div
        class="cursor-pointer text-2xl"
        v-for="word in splitSentence(initialCorpusSentence)"
        @click="exploreWord(word)"
      >
        {{ word }}
      </div>
    </div>
    <div v-else>
      <div class="border-b-2 p-2 mb-5 flex gap-5 items-center">
        <div class="">
          exploring:
          <span class="text-3xl">{{ exploredWord }}</span>
        </div>
        <button class="btn btn-small text-sm" @click="exploredWord = null">
          Back to sentence
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <div
          class="flex gap-2 flex-wrap flex-row-reverse p-2"
          v-for="sentence in relevantCorpusSentences"
          :class="
            relevantCorpusSentences.indexOf(sentence) % 2 == 0
              ? 'bg-gray-700'
              : ''
          "
        >
          <!-- mark word (text marker background effect) in sentence is tis the exploredWord -->
          <div
            class="cursor-pointer text-2xl"
            :class="word.includes(exploredWord) ? 'bg-yellow-300' : ''"
            v-for="word in splitSentence(sentence)"
            @click="exploreWord(word)"
          >
            {{ word }}
          </div>
        </div>

        <div class="">
        <button class="btn" @click=translateRandomWord>Translate Random Word</button>
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
