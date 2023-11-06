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
console.log(`overall found ${allVocabSentences.length} sentences with vocab`);

const initialCorpusSentence = ref(null);

function splitSentence(sentence) {
  if (!sentence) return [];
  return sentence.split(" ");
}

// LESSONS //

import lessons from "@/lessons.json";
console.log("LESSONS", lessons);
</script>

<template>
  <div class="" v-for="lesson in lessons">
    <ul class="list-disc">
      <li v-for="word in lesson">word: {{ word }}]}</li>
    </ul>
  </div>
</template>

<style scoped></style>
