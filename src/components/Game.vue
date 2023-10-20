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
const corpusSentences = corpusData["sentences"];

const corpusSentence = ref(null);
corpusSentence.value =
  corpusSentences[Math.floor(Math.random() * corpusSentences.length)];

// TODObut, implement: new exercises should be included, and deleted should be deleted
if (localStorage.getItem("exercises")) {
  const exercisesFromStore = JSON.parse(localStorage.getItem("exercises"));
  const exercisesFromJSON = exercises;
  exercises = exercisesFromStore;
  // if there are new exercises in the JSON (in case backend got updated), add them to the exercises array
  // find match by 'sentence_en' property
  for (const exercise of exercisesFromJSON) {
    if (
      !exercisesFromStore
        .map((e) => e.sentence_en)
        .includes(exercise.sentence_en)
    ) {
      exercises.push(exercise);
    }
  }
  // if exercises were deleted from the JSON, delete them from the exercises array (check sentence_en, sentence_ar, and question)
  for (const exercise of exercisesFromStore) {
    if (
      !exercisesFromJSON
        .map((e) => e.sentence_en)
        .includes(exercise.sentence_en) ||
      !exercisesFromJSON
        .map((e) => e.sentence_ar)
        .includes(exercise.sentence_ar) ||
      !exercisesFromJSON.map((e) => e.question).includes(exercise.question)
    ) {
      exercises.splice(
        exercises.findIndex((e) => e.sentence_en == exercise.sentence_en),
        1
      );
    }
  }
}

// same stuff with highscores
let highscores = ref([]);
if (localStorage.getItem("highscores")) {
  highscores.value = JSON.parse(localStorage.getItem("highscores"));
}

function getNextExercise() {
  clearTimeout(timeoutId.value);
  // check if time is left on the timer
  if (currentTime.value >= totalTime.value) {
    timerRunning.value = false;
    toaster.info("Time's up!");
    setGameMode("game-ended");
    return;
  }

  isReverseOrder.value = Math.random() < 0.5;

  isRevealed.value = false;
  let possibleExercises = exercises.filter(
    (exercise) => exercise.sr.due <= Math.floor(new Date().getTime() / 1000)
  );
  if (possibleExercises.length == 0) {
    alert("You have absolutely nothing to practice right now. Good job.");
    return;
  }
  exercise.value =
    possibleExercises[Math.floor(Math.random() * possibleExercises.length)];
  timerRunning.value = true;
}

function userSawExerciseBefore() {
  return exercise.value.stats.length > 0;
}

function moveToNextExercise() {
  if (isRevealed.value) {
    getNextExercise();
  }
}

function handleAnswer(rating) {
  timerRunning.value = false;
  isRevealed.value = true;
  // trigger automatic next exercise after 3 seconds
  timeoutId.value = setTimeout(() => {
    moveToNextExercise();
  }, 5000);

  exercisesDoneThisSession.value++;
  lastAnswerWasCorrect.value = rating;

  // Usual naive SR
  // if answer correct, double interval, if incorrect, half interval (minimum 10)
  if (rating) {
    streak.value++;

    exercise.value.sr.repetitions++;
    exercise.value.sr.interval =
      exercise.value.sr.interval * 2 * exercise.value.sr.repetitions;
    // if the repetition before this one was more than 16h ago, set the interval to at least 16h
    if (
      exercise.value.stats.length > 1 &&
      exercise.value.stats[exercise.value.stats.length - 2].timestamp <
        Math.floor(new Date().getTime() / 1000) - 16 * 60 * 60
    ) {
      exercise.value.sr.interval = Math.max(
        exercise.value.sr.interval,
        16 * 60 * 60
      );
    }

    // time and score
    currentTime.value -= 5;
    toaster.success(`+5 seconds`);
    const pointsToAdd = 10 + streak.value * 2;
    score.value += pointsToAdd;
    toaster.success(`+${pointsToAdd}`);
  } else {
    streak.value = 0;
    incorrectAnswerCounter.value++;
    exercise.value.sr.repetitions = 0;

    // time and score
    const addToTime = 2 * incorrectAnswerCounter.value + 1;
    currentTime.value += addToTime;
    toaster.error(`-${addToTime} seconds`);
  }

  // set due to now + interval
  exercise.value.sr.due =
    Math.floor(new Date().getTime() / 1000) + exercise.value.sr.interval;
  const statsObj = {
    guessWasCorrect: rating,
    timestamp: Math.floor(new Date().getTime() / 1000),
    exercise: exercise.question,
    answer_options: [exercise.correct_answer, exercise.wrong_answer],
  };
  exercise.value.stats.push(statsObj);
  // save the sentencesBank and exercises to localStorage
  localStorage.setItem("exercises", JSON.stringify(exercises));
  sendDataToBackend(statsObj);
}

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

function setGameMode(mode) {
  if (mode == gameMode.value) {
    return;
  }
  gameMode.value = mode;
  if (mode == "go") {
    score.value = 0;
    // reset timer stuff (second may be not necessary)
    currentTime.value = 0;
    totalTime.value = 60;
    streak.value = 0;
    incorrectAnswerCounter.value = 0;
    exercisesDoneThisSession.value = 0;

    startTimer();
    getNextExercise();
  } else if (mode == "game-ended") {
    lastScore.value = score.value;
    // toast when score is higher than 10th entry in highscores
    if (highscores.value.length < 10) {
      toaster.success("New Top 10 Entry!");
    } else {
      if (score.value > highscores.value[9].score) {
        toaster.success("New Top 10 Entry!");
      }
    }
    // toast for new personal best
    if (highscores.value.length == 0) {
      toaster.success("New Personal Best!");
    } else {
      if (score.value > highscores.value[0].score) {
        toaster.success("New Personal Best!");
      }
    }
    // save highscore
    highscores.value.push({
      score: score.value,
      date: new Date().toISOString(),
    });
    localStorage.setItem("highscores", JSON.stringify(highscores.value));
    setGameMode("undetermined");
  }
}

function sortedHighscores() {
  return highscores.value.sort((a, b) => b.score - a.score);
}

const isReverseOrder = ref(false);

// add global keypress event listener in mounted:
// on enter, show next card
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key == "ArrowLeft") {
      if (gameMode.value == "go" && !isRevealed.value) {
        handleAnswer(!isReverseOrder.value);
      }
    } else if (e.key == "ArrowRight") {
      if (gameMode.value == "go" && !isRevealed.value) {
        handleAnswer(isReverseOrder.value);
      }
    } else if (e.key == "Enter") {
      if (gameMode.value == "go" && isRevealed.value) {
        getNextExercise();
        return;
      }
      if (gameMode.value == "undetermined") {
        setGameMode("go");
      }
    }
  });
});

const totalTime = ref(60.0); // Total time in seconds
const currentTime = ref(0.0); // Current time in seconds
const timerRunning = ref(false);
const timer = ref(null);

const remainingTime = computed(() => totalTime.value - currentTime.value);
const progressStyle = computed(() => ({
  width: `${(1 - currentTime.value / totalTime.value) * 100}%`,
}));

function startTimer() {
  timerRunning.value = true;
  timer.value = setInterval(updateTime, 1000);
}

function updateTime() {
  if (timerRunning.value) {
    currentTime.value += 1;
  }
}

function splitSentence(sentence) {
  return sentence.split(" ");
}
</script>

<template>
  <div
    class="card bg-gray-600 shadow-xl my-4 p-4 flex flex-col justify-start items-center min-w-sm max-w-screen-xl"
    style="min-height: 390px"
  >
    <div class="flex gap-2 flex-wrap">
      <div class="btn" v-for="word in splitSentence(corpusSentence)">
        {{ word }}
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
