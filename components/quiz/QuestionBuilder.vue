<template>
  <div class="space-y-8">
    <!-- Question List -->
    <div v-if="questions.length > 0" class="space-y-4">
      <UCard
        v-for="(question, index) in questions"
        :key="index"
        class="rounded-xl"
      >
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white font-bold text-sm">
                {{ index + 1 }}
              </div>
              <div>
                <UBadge variant="soft" color="primary" size="xs">
                  {{ getQuestionTypeLabel(question.type) }}
                </UBadge>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <UButton size="xs" variant="ghost" icon="i-heroicons-arrow-up" :disabled="disabled || index === 0" @click="moveQuestion(index, index - 1)" />
              <UButton size="xs" variant="ghost" icon="i-heroicons-arrow-down" :disabled="disabled || index === questions.length - 1" @click="moveQuestion(index, index + 1)" />
              <UButton size="xs" variant="ghost" icon="i-heroicons-pencil" :disabled="disabled" @click="editQuestion(index)" />
              <UButton size="xs" variant="ghost" icon="i-heroicons-trash" :disabled="disabled" @click="removeQuestion(index)" />
            </div>
          </div>

          <div class="space-y-4">
            <!-- Question Text -->
            <div>
              <h4 class="font-semibold text-slate-900 dark:text-white text-base mb-2">Question:</h4>
              <div class="prose prose-sm max-w-none text-slate-700 dark:text-slate-300" v-html="question.text"></div>
            </div>

            <!-- Media Display -->
            <div v-if="question.media" class="mt-4">
              <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <UIcon name="i-heroicons-paper-clip" class="h-4 w-4" />
                Media:
              </h5>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800/50 dark:border-slate-700">
                <div v-if="question.media.type === 'image'" class="text-center">
                  <img :src="question.media.url" class="max-h-48 mx-auto rounded-lg shadow-lg" />
                </div>
                <div v-else-if="question.media.type === 'audio'" class="text-center">
                  <audio :src="question.media.url" controls class="w-full max-w-md mx-auto"></audio>
                </div>
                <div v-else-if="question.media.type === 'video'" class="text-center max-w-md mx-auto">
                  <div class="aspect-video rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      :src="getYouTubeEmbedUrl(question.media.url)"
                      class="w-full h-full"
                      frameborder="0"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            <!-- Options/Answer Display -->
            <div v-if="question.type === 'multiple_choice' || question.type === 'true_false'">
              <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <UIcon name="i-heroicons-list-bullet" class="h-4 w-4" />
                Options {{ question.is_multiple_choice ? '(Multiple Choice)' : '(Single Choice)' }}:
              </h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="flex items-center gap-3 p-3 rounded-lg border"
                  :class="option.is_correct ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'"
                >
                  <span class="flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs"
                        :class="option.is_correct ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-300'">
                    {{ String.fromCharCode(65 + optIndex) }}
                  </span>
                  <span class="flex-1 text-sm font-medium" :class="option.is_correct ? 'text-green-800 dark:text-green-200' : 'text-slate-700 dark:text-slate-300'" v-html="option.text">
                  </span>
                  <span v-if="option.is_correct" class="text-green-600 dark:text-green-400">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div v-else-if="question.type === 'short_answer'">
              <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-2">Expected Answer:</h5>
              <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-700">
                <span class="text-blue-800 dark:text-blue-200 font-medium">{{ question.correct_answer }}</span>
              </div>
            </div>

            <div v-else-if="question.type === 'fill_blanks'">
              <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-3">Fill in the Blanks:</h5>
              <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-700">
                <div class="space-y-2">
                  <div
                    v-for="(part, index) in question.fill_parts"
                    :key="index"
                    class="inline"
                  >
                    <span class="text-orange-800 dark:text-orange-200" v-html="part"></span>
                    <span v-if="index < question.fill_parts.length - 1" class="inline-flex items-center justify-center w-16 h-8 bg-white border border-dashed border-orange-300 rounded-lg mx-2 text-orange-600 font-bold">
                      ___
                    </span>
                  </div>
                </div>
                <div class="mt-3 text-sm text-orange-700 dark:text-orange-300">
                  <strong>Answers:</strong>
                  <span v-for="(answer, index) in question.correct_answers" :key="index" class="ml-2">
                    {{ index + 1 }}. {{ answer }}
                  </span>
                </div>
                <div v-if="question.is_multiple_choice && question.options" class="mt-3">
                  <div class="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Multiple Choice Options:</div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      v-for="(option, optIndex) in question.options"
                      :key="optIndex"
                      class="flex items-center gap-2 p-2 bg-white/50 rounded-lg"
                    >
                      <span class="font-bold text-orange-600">{{ String.fromCharCode(65 + optIndex) }}.</span>
                      <span class="text-sm" v-html="option.text"></span>
                      <span v-if="option.is_correct" class="text-green-600 ml-auto">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="question.type === 'essay'">
              <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-900/20 dark:border-purple-700">
                <span class="text-purple-800 dark:text-purple-200 font-medium">Essay/Long Answer Question</span>
              </div>
            </div>

            <!-- Explanation -->
            <div v-if="question.explanation" class="mt-4">
              <h5 class="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                <UIcon name="i-heroicons-light-bulb" class="h-4 w-4" />
                Explanation:
              </h5>
              <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-700">
                <div class="prose prose-sm max-w-none text-amber-800 dark:text-amber-200" v-html="question.explanation"></div>
              </div>
            </div>


          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div v-else class="rounded-xl border-2 border-dashed border-slate-300/60 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/20">
      <div class="relative z-10">
        <div class="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4">
          <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No questions added yet</h3>
        <p v-if="disabled" class="text-sm text-slate-600 dark:text-slate-400">
          Please select a grade, subject, and topic to start adding questions 📚
        </p>
        <p v-else class="text-sm text-slate-600 dark:text-slate-400">Get started by creating your first question ✨</p>
      </div>
    </div>

    <!-- Add Question Buttons -->
    <div class="flex flex-col sm:flex-row justify-center gap-4 pt-4">
      <UButton
        size="md"
        color="primary"
        icon="i-heroicons-plus-circle"
        :disabled="disabled || !canAddQuestion"
        @click="openQuestionModal"
      >
        Create New Question
      </UButton>

      <UButton
        size="md"
        variant="soft"
        icon="i-heroicons-building-library"
        :disabled="disabled"
        @click="openQuestionBankModal"
      >
        Add from Question Bank
      </UButton>
    </div>

    <!-- Question Modal -->
    <UModal
      v-model="showQuestionModal"
      :prevent-close="isSubmitting"
      class="w-full max-w-7xl"
      :ui="{ base: 'mx-3 sm:mx-6 lg:mx-auto', width: 'sm:max-w-7xl' }"
    >
      <div class="p-4 sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
            {{ editingIndex === null ? 'Create New Question' : 'Edit Question' }}
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">Question {{ editingIndex !== null ? editingIndex + 1 : questions.length + 1 }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex lg:flex-row-reverse">
          <div class="lg:col-span-2 lg:flex-1">
            <form @submit.prevent="saveQuestion" class="space-y-8">
          <!-- Question Type Selection -->
          <div class="space-y-4">
            <label class="block text-sm font-bold text-slate-800 dark:text-slate-200">Question Type</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                v-for="type in questionTypes"
                :key="type.value"
                type="button"
                @click="onQuestionTypeChange(type.value)"
                class="group p-3 rounded-lg border-2 transition-all duration-300 text-left"
                :class="questionForm.type === type.value
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'"
              >
                <div class="flex flex-col items-center gap-2">
                  <span class="text-2xl">{{ type.icon }}</span>
                  <span class="text-sm font-semibold text-center">{{ type.label }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Question Text with Rich Editor -->
          <div class="space-y-4">
            <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UIcon name="i-heroicons-question-mark-circle" class="h-5 w-5" />
              Question Text
            </label>
            <div class="relative">
              <RichTextEditor
                v-model="questionForm.value.text"
                placeholder="Enter your question here... (supports rich text, math formulas, and code)"
                class="min-h-[120px] rounded-lg border border-slate-200/60 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80"
                :features="{ math: true, code: true }"
              />
            </div>
          </div>

          <!-- Media Upload Section -->
          <div class="space-y-4">
            <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UIcon name="i-heroicons-paper-clip" class="h-5 w-5" />
              Media (Optional)
            </label>

            <!-- Media Type Selection -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                v-for="mediaType in mediaTypes"
                :key="mediaType.value"
                type="button"
                @click="questionForm.media = questionForm.media || {}; questionForm.media.type = mediaType.value"
                class="group p-3 rounded-lg border-2 transition-all duration-300 text-left"
                :class="(questionForm.media?.type === mediaType.value)
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'"
              >
                <div class="flex flex-col items-center gap-1">
                  <span class="text-lg">{{ mediaType.icon }}</span>
                  <span class="text-xs font-semibold text-center">{{ mediaType.label }}</span>
                </div>
              </button>
            </div>

            <!-- Media Upload/Input Based on Type -->
            <div v-if="questionForm.media?.type" class="space-y-4">
              <div v-if="questionForm.media.type === 'image'" class="space-y-3">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload Image</label>
                <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center bg-slate-50 dark:bg-slate-800/50">
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="hidden"
                  />
                  <div v-if="!questionForm.media.url" class="space-y-3">
                    <div class="mx-auto w-12 h-12 text-slate-400">
                      <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <UButton
                        variant="soft"
                        @click="$refs.imageInput.click()"
                        class="rounded-lg"
                      >
                        Choose Image
                      </UButton>
                    </div>
                    <p class="text-sm text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <div v-else class="space-y-3">
                    <img :src="questionForm.media.url" class="max-h-32 mx-auto rounded-lg shadow-lg" />
                    <div class="flex gap-2 justify-center">
                      <UButton
                        size="sm"
                        variant="soft"
                        @click="$refs.imageInput.click()"
                        class="rounded-lg"
                      >
                        Change
                      </UButton>
                      <UButton
                        size="sm"
                        variant="soft"
                        color="red"
                        @click="removeMedia"
                        class="rounded-lg"
                      >
                        Remove
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="questionForm.media.type === 'audio'" class="space-y-3">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload Audio</label>
                <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center bg-slate-50 dark:bg-slate-800/50">
                  <input
                    ref="audioInput"
                    type="file"
                    accept="audio/*"
                    @change="handleAudioUpload"
                    class="hidden"
                  />
                  <div v-if="!questionForm.media.url" class="space-y-3">
                    <div class="mx-auto w-12 h-12 text-slate-400">
                      <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div>
                      <UButton
                        variant="soft"
                        @click="$refs.audioInput.click()"
                        class="rounded-lg"
                      >
                        Choose Audio
                      </UButton>
                    </div>
                    <p class="text-sm text-slate-500">MP3, WAV, M4A up to 10MB</p>
                  </div>
                  <div v-else class="space-y-3">
                    <audio :src="questionForm.media.url" controls class="w-full max-w-md mx-auto"></audio>
                    <div class="flex gap-2 justify-center">
                      <UButton
                        size="sm"
                        variant="soft"
                        @click="$refs.audioInput.click()"
                        class="rounded-lg"
                      >
                        Change
                      </UButton>
                      <UButton
                        size="sm"
                        variant="soft"
                        color="red"
                        @click="removeMedia"
                        class="rounded-lg"
                      >
                        Remove
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="questionForm.media.type === 'video'" class="space-y-3">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">YouTube Video URL</label>
                <UInput
                  v-model="questionForm.media.url"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p class="text-xs text-slate-500">Paste a YouTube video URL to embed it with your question</p>
                <div v-if="questionForm.media.url && isValidYouTubeUrl(questionForm.media.url)" class="mt-3 max-w-md">
                  <div class="aspect-video rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      :src="getYouTubeEmbedUrl(questionForm.media.url)"
                      class="w-full h-full"
                      frameborder="0"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Content Based on Question Type -->
          <div v-if="questionForm.type === 'multiple_choice'" class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <UIcon name="i-heroicons-list-bullet" class="h-5 w-5" />
                  Answer Options
                </label>
                <div class="flex items-center gap-2">
                  <label class="text-sm text-slate-600 dark:text-slate-400">Single Choice</label>
                  <input
                    v-model="questionForm.is_multiple_choice"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  <label class="text-sm text-slate-600 dark:text-slate-400">Multiple Choice</label>
                </div>
              </div>
              <UButton
                v-if="questionForm.options.length < 6"
                size="sm"
                color="gray"
                variant="soft"
                icon="i-heroicons-plus"
                @click="addOption"
                type="button"
                class="rounded-lg"
              >
                Add Option
              </UButton>
            </div>

            <div class="space-y-4">
              <div
                v-for="(option, index) in questionForm.options"
                :key="index"
                class="group flex items-center gap-4 p-3 rounded-lg border transition-all duration-300"
                :class="questionForm.is_multiple_choice
                  ? (option.is_correct ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800')
                  : (correctOptionIndex === index ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800')"
              >
                <div v-if="questionForm.is_multiple_choice" class="flex-shrink-0">
                  <input
                    :checked="option.is_correct"
                    type="checkbox"
                    @change="toggleOptionCorrect(index)"
                    class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <URadio
                  v-else
                  v-model="correctOptionIndex"
                  :value="index"
                  :name="'correct-option'"
                  class="flex-shrink-0"
                />
                <div class="flex-1">
                  <RichTextEditor
                    v-model="option.text"
                    :placeholder="`Option ${String.fromCharCode(65 + index)}`"
                    class="min-h-[40px] max-h-40 overflow-y-auto"
                    :features="{ math: true, code: true }"
                  />
                </div>
                <UButton
                  v-if="questionForm.options.length > 2"
                  size="sm"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  @click="() => removeOption(index)"
                  class="flex-shrink-0 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div v-else-if="questionForm.type === 'true_false'" class="space-y-4">
            <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UIcon name="i-heroicons-check-badge" class="h-5 w-5" />
              Correct Answer
            </label>
            <div class="flex gap-6">
              <label class="flex items-center gap-3 cursor-pointer">
                <URadio v-model="correctOptionIndex" :value="0" name="true-false" />
                <span class="text-lg font-semibold text-green-600">True</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <URadio v-model="correctOptionIndex" :value="1" name="true-false" />
                <span class="text-lg font-semibold text-red-600">False</span>
              </label>
            </div>
          </div>

          <div v-else-if="questionForm.type === 'short_answer'" class="space-y-4">
            <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UIcon name="i-heroicons-pencil" class="h-5 w-5" />
              Expected Answer
            </label>
            <UInput
              v-model="questionForm.correct_answer"
              placeholder="Enter the expected answer"
              required
            />
          </div>

          <div v-else-if="questionForm.type === 'fill_blanks'" class="space-y-6">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <UIcon name="i-heroicons-squares-plus" class="h-5 w-5" />
                Fill in the Blanks
              </label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 text-sm">
                  <input
                    v-model="questionForm.is_multiple_choice"
                    type="checkbox"
                    class="rounded border-slate-300"
                  />
                  Multiple Choice
                </label>
                <UButton
                  v-if="questionForm.fill_parts.length < 10"
                  size="sm"
                  color="gray"
                  variant="soft"
                  icon="i-heroicons-plus"
                  @click="addBlank"
                  type="button"
                  class="rounded-lg"
                >
                  Add Blank
                </UButton>
              </div>
            </div>

            <div class="space-y-4">
              <div
                v-for="(part, index) in questionForm.fill_parts"
                :key="index"
                class="flex flex-col sm:flex-row gap-4 sm:items-center"
              >
                <div class="flex-1">
                  <label class="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Text Part {{ index + 1 }}
                  </label>
                  <RichTextEditor
                    v-model="questionForm.fill_parts[index]"
                    :placeholder="index === 0 ? 'Text before first blank...' : `Text before blank ${index + 1}...`"
                    class="min-h-[60px]"
                    :features="{ math: true, code: true }"
                  />
                </div>

                <div v-if="index < questionForm.fill_parts.length - 1" class="flex items-center gap-2 w-full sm:w-auto">
                  <div class="w-16 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <span class="text-lg">___</span>
                  </div>
                  <div class="w-32">
                    <label class="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Answer {{ index + 1 }}
                    </label>
                    <UInput
                      v-model="questionForm.correct_answers[index]"
                      :placeholder="`Answer ${index + 1}`"
                      size="sm"
                      class="rounded-lg"
                      required
                    />
                  </div>
                  <UButton
                    v-if="questionForm.fill_parts.length > 2"
                    size="sm"
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-x-mark"
                    @click="removeBlank(index)"
                    class="flex-shrink-0 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div v-if="questionForm.is_multiple_choice" class="space-y-4 mt-6">
              <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <UIcon name="i-heroicons-list-bullet" class="h-5 w-5" />
                Multiple Choice Options (Optional)
              </label>
              <div class="space-y-3">
                <div
                  v-for="(option, optIndex) in questionForm.options"
                  :key="optIndex"
                  class="group flex items-center gap-4 p-3 rounded-lg border transition-all duration-300"
                  :class="correctOptionIndex === optIndex
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'"
                >
                  <URadio
                    v-model="correctOptionIndex"
                    :value="optIndex"
                    :name="'fill-blanks-correct'"
                    class="flex-shrink-0"
                  />
                  <div class="flex-1">
                    <RichTextEditor
                      v-model="option.text"
                      :placeholder="`Option ${String.fromCharCode(65 + optIndex)}`"
                      class="min-h-[60px]"
                      :features="{ math: true, code: true }"
                    />
                  </div>
                  <UButton
                    v-if="questionForm.options.length > 2"
                    size="sm"
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-x-mark"
                    @click="removeOption(optIndex)"
                    class="flex-shrink-0 rounded-lg"
                  />
                </div>
              </div>
              <UButton
                v-if="questionForm.options.length < 6"
                size="sm"
                color="gray"
                variant="soft"
                icon="i-heroicons-plus"
                @click="addOption"
                type="button"
                class="rounded-lg"
              >
                Add Option
              </UButton>
            </div>
          </div>

          <!-- Explanation (for all question types) -->
          <div class="space-y-4">
            <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UIcon name="i-heroicons-light-bulb" class="h-5 w-5" />
              Explanation (Optional)
            </label>
            <div class="relative">
              <RichTextEditor
                v-model="questionForm.explanation"
                placeholder="Explain the answer and provide additional context..."
                class="min-h-[100px] rounded-lg border border-slate-200/60 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80"
                :features="{ math: true, code: true }"
              />
            </div>
          </div>

          <!-- Solution Steps (for math and code questions) -->
          <div v-if="questionForm.type === 'math' || questionForm.type === 'code'" class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <UIcon name="i-heroicons-calculator" class="h-5 w-5" />
                Solution Steps
              </label>
              <UButton
                size="sm"
                color="primary"
                variant="soft"
                icon="i-heroicons-plus"
                @click="addSolutionStep"
                type="button"
                class="rounded-lg"
              >
                Add Step
              </UButton>
            </div>

            <div class="space-y-4">
              <div
                v-for="(step, index) in questionForm.solution_steps"
                :key="index"
                class="group flex gap-4 p-3 rounded-lg border border-indigo-200/60 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-700/60"
              >
                <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500 text-white font-bold text-sm flex-shrink-0">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <RichTextEditor
                    v-model="questionForm.solution_steps[index]"
                    :placeholder="`Step ${index + 1} explanation...`"
                    class="min-h-[80px]"
                    :features="{ math: true, code: true }"
                  />
                </div>
                <UButton
                  size="sm"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  @click="removeSolutionStep(index)"
                  class="flex-shrink-0 rounded-lg"
                />
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <UButton
              color="gray"
              variant="soft"
              @click="closeQuestionModal"
              :disabled="isSubmitting"
              class="rounded-lg px-4 py-2 font-semibold"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              type="submit"
              :loading="isSubmitting"
              :disabled="!isQuestionValid"
              class="rounded-lg px-4 py-2 font-bold"
            >
              {{ editingIndex === null ? 'Create Question' : 'Save Changes' }}
            </UButton>
          </div>
          </form>
          </div>

          <aside class="lg:col-span-1 lg:w-1/3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300">
            <header class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-gray-800 dark:text-white">Live preview</h4>
              <span class="text-xs text-gray-400 dark:text-gray-500">quiz view</span>
            </header>

            <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/20 p-3 mb-3">
              <div v-html="questionForm.value.text || '<em class=\'text-gray-500 dark:text-gray-400\'>Start typing your question…</em>'" class="prose prose-sm dark:prose-invert max-w-none"></div>
            </div>

            <div v-if="questionForm.value.type !== 'fill_blank' && questionForm.value.options?.length" class="mb-3">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-300">Options</label>
              <div class="space-y-2 mt-2">
                <div v-for="(opt, i) in questionForm.value.options" :key="i" class="rounded-md bg-white dark:bg-gray-900/30 p-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center gap-2"><span class="font-semibold text-xs text-gray-500 dark:text-gray-400">{{ i + 1 }}</span><div class="text-sm" v-text="opt?.text || ('Option ' + (i+1))"></div></div>
                </div>
              </div>
            </div>

            <div v-if="questionForm.value.difficulty !== undefined" class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900/30">
              <div class="flex items-center justify-between mb-2"><span class="text-xs text-gray-500 dark:text-gray-400">Difficulty</span><span class="text-sm font-semibold text-gray-800 dark:text-white">{{ questionForm.value.difficulty }}</span></div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Use the slider to tune difficulty (1–5).
              </div>
            </div>

            <div v-if="savedQuestion" class="mt-4 border-l-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded">
              <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-semibold text-emerald-300">Question saved</div>
                <div class="text-xs text-slate-400">ID: {{ savedQuestion.id }}</div>
              </div>
              <div class="flex gap-2">
                <button @click="shareSaved" class="text-xs bg-indigo-600 px-2 py-1 rounded text-white">Share</button>
                <button @click="createAnother" class="text-xs bg-slate-700 px-2 py-1 rounded text-white">Create another</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </UModal>

    <!-- Question Bank Modal -->
    <QuestionBankModal
      :model-value="showQuestionBankModal"
      :grade-options="gradeOptions"
      :subject-options="subjectOptions"
      :topic-options="topicOptions"
      @update:model-value="showQuestionBankModal = $event"
      @add="addFromBank"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import RichTextEditor from '~/components/editor/RichTextEditor.vue'
import QuestionBankModal from '~/components/bank/QuestionBankModal.vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    default: () => []
  },
  gradeId: {
    type: Number,
    required: false,
    default: null
  },
  subjectId: {
    type: Number,
    required: false,
    default: null
  },
  topicId: {
    type: Number,
    required: false,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxQuestions: {
    type: Number,
    default: 50
  },
  gradeOptions: {
    type: Array,
    default: () => []
  },
  subjectOptions: {
    type: Array,
    default: () => []
  },
  topicOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:questions', 'save-question'])
const alert = useAppAlert()

// Question Types
const questionTypes = ref([
  { value: 'multiple_choice', label: 'Multiple Choice', icon: '📝' },
  { value: 'true_false', label: 'True/False', icon: '✅' },
  { value: 'short_answer', label: 'Short Answer', icon: '✍️' },
  { value: 'fill_blanks', label: 'Fill in Blanks', icon: '🔲' },
  { value: 'essay', label: 'Essay', icon: '📄' },
  { value: 'math', label: 'Math', icon: '🔢' },
  { value: 'code', label: 'Code', icon: '💻' }
])

// Media Types
const mediaTypes = ref([
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'video', label: 'Video', icon: '🎥' }
])

// State
const showQuestionModal = ref(false)
const showQuestionBankModal = ref(false)
const editingIndex = ref(null)
const isSubmitting = ref(false)
const correctOptionIndex = ref(0)
const questionErrors = ref({})

// Default question forms for different types
const getDefaultQuestionForm = (type = 'multiple_choice') => {
  const baseForm = {
    type,
    text: '',
    explanation: '',
    solution_steps: [],
    media: null,
    is_multiple_choice: false
  }

  switch (type) {
    case 'multiple_choice':
      return {
        ...baseForm,
        options: [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      }
    case 'true_false':
      return {
        ...baseForm,
        options: [
          { text: 'True', is_correct: true },
          { text: 'False', is_correct: false }
        ]
      }
    case 'short_answer':
      return {
        ...baseForm,
        correct_answer: ''
      }
    case 'fill_blanks':
      return {
        ...baseForm,
        fill_parts: ['', ''],
        correct_answers: ['', '']
      }
    case 'essay':
      return baseForm
    case 'math':
    case 'code':
      return {
        ...baseForm,
        solution_steps: ['']
      }
    default:
      return baseForm
  }
}

function normalizeQuestionFormShape(form) {
  if (!form || typeof form !== 'object') {
    return getDefaultQuestionForm()
  }

  if (!Array.isArray(form.options)) {
    form.options = []
  }
  if (!Array.isArray(form.solution_steps)) {
    form.solution_steps = []
  }
  if (!Array.isArray(form.fill_parts)) {
    form.fill_parts = []
  }
  if (!Array.isArray(form.correct_answers)) {
    form.correct_answers = []
  }

  if (form.type === 'multiple_choice' && form.options.length < 2) {
    const defaults = getDefaultQuestionForm('multiple_choice')
    form.options = JSON.parse(JSON.stringify(defaults.options))
  }

  if (form.type === 'true_false') {
    const defaults = getDefaultQuestionForm('true_false')
    if (form.options.length !== 2) {
      form.options = defaults.options
    }
  }

  if (form.type === 'fill_blanks') {
    if (form.fill_parts.length < 2) {
      form.fill_parts = ['', '']
    }
    const blanksCount = Math.max(form.fill_parts.length - 1, 1)
    while (form.correct_answers.length < blanksCount) {
      form.correct_answers.push('')
    }
    if (form.correct_answers.length > blanksCount) {
      form.correct_answers.splice(blanksCount)
    }

    if (!Array.isArray(form.options)) {
      form.options = []
    }
    if (form.is_multiple_choice) {
      if (form.options.length < 2) {
        form.options = JSON.parse(JSON.stringify(getDefaultQuestionForm('multiple_choice').options))
      }
    }

    if (form.options.length < 2) {
      form.is_multiple_choice = false
      form.options = []
    }
  }

  if ((form.type === 'math' || form.type === 'code') && form.solution_steps.length === 0) {
    form.solution_steps = ['']
  }

  if (form.type !== 'fill_blanks' && form.correct_answers.length > 0) {
    form.correct_answers = form.correct_answers.filter(answer => answer !== undefined)
  }

  return form
}

const questionForm = ref(normalizeQuestionFormShape(getDefaultQuestionForm()))

// Computed
const canAddQuestion = computed(() => {
  return props.questions.length < props.maxQuestions
})

const isQuestionValid = computed(() => {
  if (!questionForm.value.text.trim()) return false

  switch (questionForm.value.type) {
    case 'multiple_choice':
      const hasValidOptions = questionForm.value.options.every(opt => opt.text.trim())
      if (questionForm.value.is_multiple_choice) {
        // For multiple choice, at least one option must be correct
        return hasValidOptions && questionForm.value.options.some(opt => opt.is_correct)
      } else {
        // For single choice, one specific option must be selected
        return hasValidOptions && correctOptionIndex.value !== null
      }
    case 'true_false':
      return correctOptionIndex.value !== null
    case 'short_answer':
      return questionForm.value.correct_answer?.trim()
    case 'fill_blanks':
      return questionForm.value.fill_parts?.length >= 2 &&
             questionForm.value.correct_answers?.length >= 2 &&
             questionForm.value.correct_answers.every(ans => ans.trim())
    case 'essay':
      return true
    case 'math':
    case 'code':
      return questionForm.value.solution_steps?.length > 0
    default:
      return false
  }
})

// Methods
function getQuestionTypeLabel(type) {
  const questionType = questionTypes.value.find(qt => qt.value === type)
  return questionType ? questionType.label : 'Unknown'
}

function openQuestionModal() {
  resetQuestionForm()
  showQuestionModal.value = true
}

function openQuestionBankModal() {
  showQuestionBankModal.value = true
}

function closeQuestionModal() {
  if (isSubmitting.value) return
  showQuestionModal.value = false
  resetQuestionForm()
}

function resetQuestionForm() {
  questionForm.value = normalizeQuestionFormShape(getDefaultQuestionForm('multiple_choice'))
  editingIndex.value = null
  correctOptionIndex.value = 0
  questionErrors.value = {}
}

function addOption() {
  if (questionForm.value.options.length >= 6) return
  questionForm.value.options.push({
    text: '',
    is_correct: false
  })
}

function removeOption(index) {
  if (questionForm.value.options.length <= 2) return
  questionForm.value.options.splice(index, 1)
  if (correctOptionIndex.value === index) {
    correctOptionIndex.value = 0
  } else if (correctOptionIndex.value > index) {
    correctOptionIndex.value--
  }
}

function addSolutionStep() {
  questionForm.value.solution_steps.push('')
}

function removeSolutionStep(index) {
  if (questionForm.value.solution_steps.length <= 1) return
  questionForm.value.solution_steps.splice(index, 1)
}

function addBlank() {
  if (questionForm.value.fill_parts.length >= 10) return
  questionForm.value.fill_parts.push('')
  questionForm.value.correct_answers.push('')
}

function removeBlank(index) {
  if (questionForm.value.fill_parts.length <= 2) return
  questionForm.value.fill_parts.splice(index, 1)
  questionForm.value.correct_answers.splice(index, 1)
}

function toggleOptionCorrect(index) {
  if (questionForm.value.is_multiple_choice) {
    questionForm.value.options[index].is_correct = !questionForm.value.options[index].is_correct
  }
}

// Media handling methods
function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // In a real app, you'd upload to a server here
    // For now, we'll create a data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      questionForm.value.media = questionForm.value.media || {}
      questionForm.value.media.url = e.target.result
      questionForm.value.media.file = file
    }
    reader.readAsDataURL(file)
  }
}

function handleAudioUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // In a real app, you'd upload to a server here
    // For now, we'll create a data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      questionForm.value.media = questionForm.value.media || {}
      questionForm.value.media.url = e.target.result
      questionForm.value.media.file = file
    }
    reader.readAsDataURL(file)
  }
}

function removeMedia() {
  if (questionForm.value.media) {
    questionForm.value.media = null
  }
}

function isValidYouTubeUrl(url) {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  return youtubeRegex.test(url)
}

function getYouTubeEmbedUrl(url) {
  const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
}

function moveQuestion(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= props.questions.length) return

  const newQuestions = [...props.questions]
  const [movedQuestion] = newQuestions.splice(fromIndex, 1)
  newQuestions.splice(toIndex, 0, movedQuestion)
  emit('update:questions', newQuestions)
}

function editQuestion(index) {
  const question = props.questions[index]
  questionForm.value = normalizeQuestionFormShape(JSON.parse(JSON.stringify(question)))

  // Set correct option index for multiple choice and true/false
  if (questionForm.value.type === 'multiple_choice' || questionForm.value.type === 'true_false') {
    const firstCorrectIndex = questionForm.value.options.findIndex(opt => opt.is_correct)
    correctOptionIndex.value = firstCorrectIndex !== -1 ? firstCorrectIndex : 0
  } else {
    correctOptionIndex.value = 0
  }

  editingIndex.value = index
  showQuestionModal.value = true
}

function removeQuestion(index) {
  const newQuestions = [...props.questions]
  newQuestions.splice(index, 1)
  emit('update:questions', newQuestions)
}

function addFromBank(questionOrQuestions) {
  const questionsToAdd = Array.isArray(questionOrQuestions) ? questionOrQuestions : [questionOrQuestions]

  // Convert bank question format to our format
  const convertedQuestions = questionsToAdd.map(bankQuestion => {
    const question = normalizeQuestionFormShape({
      uid: Math.random().toString(36).slice(2),
      type: bankQuestion.type || 'multiple_choice',
      text: bankQuestion.text || '',
      explanation: bankQuestion.explanation || '',
      solution_steps: [],
      media: bankQuestion.media || null,
      is_multiple_choice: !!bankQuestion.is_multiple_choice,
      options: bankQuestion.options || [],
      correct_answer: bankQuestion.correct_answer || '',
      fill_parts: bankQuestion.fill_parts || [],
      correct_answers: bankQuestion.correct_answers || []
    })

    // Ensure options carry over when applicable
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      question.options = question.options.map(opt => ({
        text: opt?.text || '',
        is_correct: !!opt?.is_correct
      }))
    }

    return question
  })

  // Add to questions list
  const newQuestions = [...props.questions, ...convertedQuestions]
  emit('update:questions', newQuestions)

  // Save each question
  convertedQuestions.forEach(question => {
    emit('save-question', question)
  })

  showQuestionBankModal.value = false

  alert.push({
    type: 'success',
    message: `Added ${convertedQuestions.length} question${convertedQuestions.length > 1 ? 's' : ''} from question bank! 📚`
  })
}

async function saveQuestion() {
  if (!isQuestionValid.value) return

  isSubmitting.value = true
  try {
    // Prepare question data based on type
    const questionData = { ...questionForm.value }

    // Handle different question types
    switch (questionData.type) {
      case 'multiple_choice':
        // For single choice, update correct answers based on selected index
        if (!questionData.is_multiple_choice) {
          questionData.options.forEach((opt, index) => {
            opt.is_correct = index === correctOptionIndex.value
          })
        }
        // For multiple choice, the is_correct flags are already set by the checkboxes
        break
      case 'true_false':
        // Set correct answer for true/false
        questionData.options.forEach((opt, index) => {
          opt.is_correct = index === correctOptionIndex.value
        })
        break
      case 'short_answer':
        // Ensure correct_answer is set
        if (!questionData.correct_answer) {
          questionData.correct_answer = ''
        }
        break
      case 'fill_blanks':
        // Filter out empty fill parts and correct answers
        questionData.fill_parts = questionData.fill_parts.filter(part => part.trim())
        questionData.correct_answers = questionData.correct_answers.filter(ans => ans.trim())
        // Handle multiple choice options if enabled
        if (questionData.is_multiple_choice && questionData.options) {
          questionData.options.forEach((opt, index) => {
            opt.is_correct = index === correctOptionIndex.value
          })
        }
        break
      case 'essay':
        // Essay questions don't need special handling
        break
      case 'math':
      case 'code':
        // Filter out empty solution steps
        questionData.solution_steps = questionData.solution_steps.filter(step => step.trim())
        break
    }

    const newQuestions = [...props.questions]
    let savedIndex = null

    if (editingIndex.value !== null) {
      newQuestions[editingIndex.value] = questionData
      savedIndex = editingIndex.value
    } else {
      newQuestions.push(questionData)
      savedIndex = newQuestions.length - 1
    }

    emit('update:questions', newQuestions)

    // Emit saved question so parent can persist
    const savedQuestion = JSON.parse(JSON.stringify(newQuestions[savedIndex]))
    emit('save-question', savedQuestion)

    closeQuestionModal()
    alert.push({
      type: 'success',
      message: `Question ${editingIndex.value !== null ? 'updated' : 'created'} successfully! 🎉`
    })
  } catch (error) {
    alert.push({
      type: 'error',
      message: 'Failed to save question. Please try again.'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(correctOptionIndex, (newIndex) => {
  if (questionForm.value.options && questionForm.value.options[newIndex]) {
    questionForm.value.options.forEach((opt, index) => {
      opt.is_correct = index === newIndex
    })
  }
})

function onQuestionTypeChange(newType) {
  if (newType === questionForm.value.type) return

  const currentText = questionForm.value.text
  const currentExplanation = questionForm.value.explanation

  questionForm.value = getDefaultQuestionForm(newType)
  questionForm.value.text = currentText
  questionForm.value.explanation = currentExplanation

  // Reset correct option index
  correctOptionIndex.value = 0
}

// Watch for question type changes to reset form appropriately
watch(() => questionForm.value.type, onQuestionTypeChange)

// Expose modal controls so parent components can open them via ref
defineExpose({ openQuestionModal, openQuestionBankModal })
</script>