<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import arabicSentencesData from '@/ara_sentences.json'
import baseCorpusData from '@/corpus1.json'
import vocabData from '@/words.json'

type SentenceMap = Record<string, string>

const STORAGE_KEYS = {
  translations: 'sentencesTranslations',
  notes: 'sentencesNotes',
  postTranslationNotes: 'postTranslationNotes',
} as const

function splitSentence(sentence: string): string[] {
  return sentence.trim() ? sentence.split(' ') : []
}

function readStorageMap(key: string): SentenceMap {
  const raw = localStorage.getItem(key)

  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

const allCorpusSentences: string[] = [
  ...baseCorpusData.sentences,
  ...arabicSentencesData.sentences,
]

const vocabWords = new Set(vocabData.words)

const allVocabSentences = allCorpusSentences.filter((sentence) => {
  const words = splitSentence(sentence)
  return words.length < 7 && words.some((word) => vocabWords.has(word))
})

const initialCorpusSentence = ref('')
const translationChecked = ref(false)
const exploredWord = ref<string | null>(null)
const explorationBreadcrumbs = ref<string[]>([])
const relevantCorpusSentences = ref<string[]>([])

const sentencesTranslations = ref<SentenceMap>(
  readStorageMap(STORAGE_KEYS.translations),
)
const sentencesNotes = ref<SentenceMap>(readStorageMap(STORAGE_KEYS.notes))
const postTranslationNotes = ref<SentenceMap>(
  readStorageMap(STORAGE_KEYS.postTranslationNotes),
)

watch(
  sentencesTranslations,
  () => {
    localStorage.setItem(
      STORAGE_KEYS.translations,
      JSON.stringify(sentencesTranslations.value),
    )
  },
  { deep: true },
)

watch(
  sentencesNotes,
  () => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(sentencesNotes.value))
  },
  { deep: true },
)

watch(
  postTranslationNotes,
  () => {
    localStorage.setItem(
      STORAGE_KEYS.postTranslationNotes,
      JSON.stringify(postTranslationNotes.value),
    )
  },
  { deep: true },
)

const translationAttempt = computed({
  get() {
    const sentence = initialCorpusSentence.value
    return sentence ? (sentencesTranslations.value[sentence] ?? '') : ''
  },
  set(value: string) {
    const sentence = initialCorpusSentence.value
    if (!sentence) {
      return
    }
    sentencesTranslations.value[sentence] = value
  },
})

const sentenceNotes = computed({
  get() {
    const sentence = initialCorpusSentence.value
    return sentence ? (sentencesNotes.value[sentence] ?? '') : ''
  },
  set(value: string) {
    const sentence = initialCorpusSentence.value
    if (!sentence) {
      return
    }
    sentencesNotes.value[sentence] = value
  },
})

const postTranslationSentenceNotes = computed({
  get() {
    const sentence = initialCorpusSentence.value
    return sentence ? (postTranslationNotes.value[sentence] ?? '') : ''
  },
  set(value: string) {
    const sentence = initialCorpusSentence.value
    if (!sentence) {
      return
    }
    postTranslationNotes.value[sentence] = value
  },
})

const canAdvance = computed(() => {
  const targetLength = splitSentence(initialCorpusSentence.value).length
  const translationLength = splitSentence(translationAttempt.value).length

  return targetLength - 2 <= translationLength && translationAttempt.value.length > 3
})

function resetExploration(): void {
  explorationBreadcrumbs.value = []
  exploredWord.value = null
  relevantCorpusSentences.value = []
}

function getNewSentence(): void {
  translationChecked.value = false
  resetExploration()

  const unpracticedSentences = allVocabSentences.filter(
    (sentence) => !sentencesTranslations.value[sentence],
  )

  const candidates = unpracticedSentences.length
    ? unpracticedSentences
    : allVocabSentences

  if (!candidates.length) {
    initialCorpusSentence.value = ''
    return
  }

  const randomSentence =
    candidates[Math.floor(Math.random() * candidates.length)] ?? ''

  initialCorpusSentence.value = randomSentence

  if (!sentencesTranslations.value[randomSentence]) {
    sentencesTranslations.value[randomSentence] = ''
  }
}

function exploreWord(word: string): void {
  explorationBreadcrumbs.value.push(word)
  exploredWord.value = word

  const shortCandidates = allCorpusSentences.filter(
    (sentence) =>
      splitSentence(sentence).includes(word) &&
      splitSentence(sentence).length < 6 &&
      sentence !== initialCorpusSentence.value,
  )

  const fallbackCandidates = allCorpusSentences.filter(
    (sentence) =>
      splitSentence(sentence).includes(word) &&
      !shortCandidates.includes(sentence) &&
      sentence !== initialCorpusSentence.value &&
      splitSentence(sentence).length < 35,
  )

  const combined = [
    ...shortCandidates,
    ...fallbackCandidates.slice(
      0,
      Math.max(0, 3 - shortCandidates.length),
    ),
  ]

  relevantCorpusSentences.value = combined.slice(0, 3)

  const additionalExample = allCorpusSentences.find(
    (sentence) =>
      splitSentence(sentence).includes(word) &&
      !combined.includes(sentence) &&
      sentence !== initialCorpusSentence.value &&
      splitSentence(sentence).length < 35,
  )

  if (additionalExample) {
    relevantCorpusSentences.value.push(additionalExample)
  }
}

function checkTranslation(): void {
  translationChecked.value = true

  if (!initialCorpusSentence.value) {
    return
  }

  window.open(
    `https://translate.google.com/?sl=ar&tl=en&text=${encodeURIComponent(initialCorpusSentence.value)}&op=translate`,
    '_blank',
    'noopener',
  )
}

getNewSentence()
</script>

<template>
  <div
    class="card my-4 flex w-full max-w-screen-2xl flex-col items-center justify-start bg-gray-600 p-4 shadow-xl"
    style="min-height: 390px"
  >
    <div v-if="!exploredWord" class="w-full">
      <h2 class="text-center text-2xl font-bold">Try to translate this sentence:</h2>
      <h3 class="mb-6 text-center">Click on a word to explore.</h3>

      <div class="flex flex-row-reverse flex-wrap justify-center gap-2">
        <div
          v-for="(word, index) in splitSentence(initialCorpusSentence)"
          :key="`${initialCorpusSentence}-${word}-${index}`"
          class="cursor-pointer text-4xl hover:bg-yellow-500"
          dir="rtl"
          @click="exploreWord(word)"
        >
          {{ word }}
        </div>
      </div>

      <div class="form-control my-4">
        <label class="input-group">
          <span class="w-52">Your translation attempt</span>
          <input
            v-model="translationAttempt"
            type="text"
            placeholder="..."
            class="input input-bordered w-full"
          />
        </label>
      </div>

      <div class="form-control my-4">
        <label class="input-group">
          <span class="w-52">Notes</span>
          <textarea
            v-model="sentenceNotes"
            placeholder="..."
            class="textarea input-bordered w-full"
            rows="7"
          ></textarea>
        </label>
      </div>

      <div v-if="translationChecked" class="form-control my-4">
        <label class="input-group">
          <span class="w-52">Post-Translation-Notes</span>
          <textarea
            v-model="postTranslationSentenceNotes"
            placeholder="Now that I've seen the translation, I..."
            class="textarea input-bordered w-full"
            rows="7"
          ></textarea>
        </label>
      </div>

      <div class="flex gap-2">
        <button class="btn" :class="canAdvance ? '' : 'btn-disabled'" @click="checkTranslation()">
          <span>Check Translation</span>
        </button>
        <button class="btn" :class="canAdvance ? '' : 'btn-disabled'" @click="getNewSentence()">
          Get Next Sentence
        </button>
      </div>
    </div>

    <div v-else>
      <div class="flex flex-col">
        <div class="mb-5 flex flex-row items-center gap-5 p-2">
          <div>
            exploring:
            <span class="text-3xl">{{ exploredWord }}</span>
          </div>

          <button class="btn btn-sm text-sm" @click="resetExploration()">Back to main sentence</button>
        </div>

        <div class="breadcrumbs mb-4 border-b border-t text-sm">
          <ul>
            <li class="cursor-pointer" @click="resetExploration()">
              {{ initialCorpusSentence.substring(0, 40) }}
              <span v-if="initialCorpusSentence.length > 40">...</span>
            </li>
            <li
              v-for="breadcrumb in explorationBreadcrumbs"
              :key="`${breadcrumb}-${initialCorpusSentence}`"
              class="cursor-pointer"
              @click="exploreWord(breadcrumb)"
            >
              {{ breadcrumb }}
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div
          v-for="sentence in relevantCorpusSentences"
          :key="sentence"
          class="rounded-lg bg-gray-700 p-4"
        >
          <div class="flex items-center justify-between gap-4 p-2">
            <div class="flex flex-row-reverse flex-wrap gap-2">
              <div
                v-for="(word, index) in splitSentence(sentence)"
                :key="`${sentence}-${word}-${index}`"
                class="cursor-pointer text-2xl"
                :class="word === exploredWord ? 'bg-yellow-600' : ''"
                dir="rtl"
                @click="exploreWord(word)"
              >
                {{ word }}
              </div>
            </div>

            <a
              :href="`https://translate.google.com/?sl=ar&tl=en&text=${encodeURIComponent(sentence)}&op=translate`"
              target="_blank"
              rel="noopener"
            >
              <span class="btn btn-sm">Translate</span>
            </a>
          </div>

          <textarea
            v-model="sentencesNotes[sentence]"
            class="w-full rounded p-2"
            placeholder="your sentence notes..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
