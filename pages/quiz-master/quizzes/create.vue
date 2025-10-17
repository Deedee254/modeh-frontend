<template>
  <div class="relative mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[420px] bg-gradient-to-br from-indigo-500/25 via-sky-400/10 to-transparent blur-3xl"></div>
    <PageHero
      :title="quizId ? 'Build Your Quiz' : 'Craft a new quiz'"
      :description="quizId ? 'Now add questions to your quiz.' : 'Define quiz details, fine‑tune delivery settings, and curate impact-driven questions from your bank or create fresh ones on the fly.'"
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Quizzes', href: '/quiz-master/quizzes' }, { text: 'Create', current: true }]"
    >
      <template #eyebrow>
        <span class="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 shadow-sm ring-1 ring-indigo-200/60 backdrop-blur dark:bg-slate-900/70 dark:text-indigo-300 dark:ring-indigo-500/40">
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-200/60 dark:ring-emerald-500/30"></span>
          Quiz creation flow
        </span>
      </template>
      <template #actions>
        <div class="flex flex-wrap items-center gap-3 sm:gap-4">
          <UButton
            size="sm"
            variant="soft"
            class="min-w-[96px] rounded-full border border-slate-200/70 bg-white/70 px-5 py-2 font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200"
            @click="$router.back()"
            icon="i-heroicons-arrow-left"
          >Cancel</UButton>
      <UButton
        size="sm"
        variant="soft"
              class="min-w-[96px] rounded-full border border-indigo-100/70 bg-indigo-50/70 px-5 py-2 font-semibold text-indigo-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-200"
              :loading="isSaving"
              @click="saveDraft"
              icon="i-heroicons-document-arrow-down"
          >Save draft</UButton>
            <UButton
              size="sm"
              variant="soft"
              class="min-w-[96px] rounded-full border border-sky-100/70 bg-sky-50/60 px-5 py-2 font-semibold text-sky-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-500/50 dark:bg-sky-500/20 dark:text-sky-200"
              @click="previewDraft"
              icon="i-heroicons-eye"
          >Preview</UButton>
              <UButton
                size="sm"
                class="min-w-[132px] rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 px-6 py-2 font-semibold text-white shadow-lg shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/60 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click="submitQuiz"
                icon="i-heroicons-paper-airplane"
            >Publish quiz</UButton>
        </div>
      </template>
    </PageHero>

    <div class="mt-8">
      <!-- Tabs -->
      <div class="mb-12">
        <nav class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 rounded-2xl bg-gradient-to-r from-white/90 via-slate-50/80 to-white/90 p-3 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/50 backdrop-blur-xl dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90 dark:ring-slate-700/50" aria-label="Tabs">
          <button
            v-for="(tab, index) in tabs"
            :key="tab.name"
            @click="activeTab = tab.name"
            :disabled="tab.disabled"
            :class="[
              activeTab === tab.name
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/40 scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/80 dark:text-slate-300 dark:hover:text-white dark:hover:from-slate-800/60 dark:hover:to-slate-700/60',
              'group relative flex items-center justify-center gap-3 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-102 active:scale-98'
            ]"
          >
            <span class="relative flex items-center gap-3">
              <span
                :class="[
                  'h-2 w-2 rounded-full transition-all duration-500',
                  activeTab === tab.name ? 'bg-white/95 shadow-lg shadow-white/50 animate-pulse' : 'bg-slate-400/70 dark:bg-slate-500/70 group-hover:bg-slate-500 dark:group-hover:bg-slate-400'
                ]"
              ></span>
              <span class="relative">
                {{ tab.label }}
                <span v-if="activeTab === tab.name" class="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/80 rounded-full animate-pulse"></span>
              </span>
            </span>
          </button>
        </nav>
      </div>

      <!-- Details Form -->
      <form v-show="activeTab === 'details'" @submit.prevent="submitQuiz">
        <div class="space-y-10">
          <UCard class="group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl hover:shadow-purple-500/20 dark:border-slate-700/40 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/80 before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/5 before:via-transparent before:to-pink-500/5 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100">
            <template #header>
              <div class="relative z-10">
                <h3 class="text-xl font-bold leading-7 text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Quiz Details</h3>
                <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Start by giving your quiz a title and description to make it shine ✨</p>
              </div>
            </template>

            <div class="relative z-10 space-y-8">
              <UFormGroup label="Quiz Title" name="title" required class="space-y-3">
                <UInput
                  v-model="form.title"
                  placeholder="e.g., Introduction to Algebra"
                  size="lg"
                  class="rounded-2xl border-2 border-slate-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-purple-400 dark:hover:border-slate-500/80"
                />
              </UFormGroup>

              <UFormGroup label="Description" name="description" hint="Optional" class="space-y-3">
                <UTextarea
                  v-model="form.description"
                  placeholder="A short summary of what this quiz is about..."
                  size="lg"
                  class="rounded-2xl border-2 border-slate-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-purple-400 dark:hover:border-slate-500/80 resize-none"
                  :rows="4"
                />
              </UFormGroup>
            </div>
          </UCard>

          <UCard class="group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl hover:shadow-blue-500/20 dark:border-slate-700/40 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/80 before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-transparent before:to-cyan-500/5 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100">
            <template #header>
              <div class="relative z-10">
                <h3 class="text-xl font-bold leading-7 text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Categorization</h3>
                <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Help others find your quiz by categorizing it properly 🎯</p>
              </div>
            </template>

            <div class="relative z-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  <UFormGroup label="Grade" name="grade_id" required class="space-y-4">
                    <div class="relative z-50">
                      <ClientOnly>
                        <USelectMenuTeleport
                          v-model="form.grade_id"
                          :options="grades"
                          value-attribute="id"
                          option-attribute="name"
                          placeholder="Select a grade"
                          size="lg"
                          class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-blue-400 dark:hover:border-slate-500/80"
                        />
                      </ClientOnly>
                    </div>
                  </UFormGroup>

              <UFormGroup label="Subject" name="subject_id" required class="space-y-4">
                <div class="relative z-50">
                  <template v-if="subjectsLoading">
                    <UiSelectSkeleton />
                  </template>
                    <template v-else>
                    <ClientOnly>
                      <USelectMenuTeleport
                        v-model="form.subject_id"
                        :options="filteredSubjects"
                        value-attribute="id"
                        option-attribute="name"
                        :placeholder="!form.grade_id ? 'Select grade first' : 'Select a subject'"
                        :disabled="!form.grade_id || subjectsLoading"
                        size="lg"
                        class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-blue-400 dark:hover:border-slate-500/80"
                      />
                    </ClientOnly>
                  </template>
                </div>
              </UFormGroup>

              <UFormGroup label="Topic" name="topic_id" required class="space-y-4">
                <div class="relative z-50 flex gap-3">
                  <div class="flex-1">
                    <template v-if="topicsLoading">
                      <UiSelectSkeleton />
                    </template>
                    <template v-else>
                      <ClientOnly>
                        <USelectMenuTeleport
                          v-model="form.topic_id"
                          :options="filteredTopics"
                          value-attribute="id"
                          option-attribute="name"
                          :placeholder="!form.subject_id ? 'Select subject first' : 'Select a topic'"
                          :disabled="!form.subject_id || topicsLoading"
                          size="lg"
                          class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-blue-400 dark:hover:border-slate-500/80"
                        />
                      </ClientOnly>
                    </template>
                  </div>
                  <UButton
                    size="sm"
                    color="primary"
                    variant="soft"
                    class="rounded-2xl px-4 py-2 font-semibold text-indigo-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                    @click="showCreateTopicModal = true"
                    :disabled="!form.subject_id"
                    icon="i-heroicons-plus"
                  >
                    Create Topic
                  </UButton>
                </div>
              </UFormGroup>
            </div>
          </UCard>

          <div class="flex flex-col gap-6 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <UButton
                variant="ghost"
                class="group rounded-2xl px-6 py-3 text-sm font-bold text-slate-500 transition-all duration-300 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60"
                @click="() => { form.value = { ...initialForm } }"
              >
                <span class="flex items-center gap-2">
                  <span class="text-lg">🔄</span>
                  Reset
                </span>
              </UButton>
            </div>
            <div class="flex flex-wrap items-center gap-4">
              <UButton
                class="group rounded-2xl bg-gradient-to-r from-slate-100/80 to-slate-50/80 px-8 py-3 font-bold text-slate-700 shadow-xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20 dark:from-slate-800/60 dark:to-slate-700/60 dark:text-white border-2 border-slate-200/60 dark:border-slate-600/60"
                @click="saveDetails"
                :loading="isSubmitting"
                :disabled="!isDetailsValid"
                size="md"
              >
                <span class="flex items-center gap-2">
                  <span class="text-lg">💾</span>
                  Save Details
                </span>
              </UButton>
              <UButton
                color="primary"
                class="group rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-10 py-3 font-bold text-white shadow-2xl shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl hover:shadow-purple-500/60 hover:scale-105"
                @click="() => nextTab('settings')"
                size="md"
              >
                <span class="flex items-center gap-2">
                  Next Step
                  <span class="text-lg">→</span>
                </span>
              </UButton>
            </div>
          </div>
        </div>
      </form>

      <!-- Settings -->
      <div v-show="activeTab === 'settings'">
        <UCard class="group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl hover:shadow-emerald-500/20 dark:border-slate-700/40 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/80 before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:via-transparent before:to-teal-500/5 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100">
          <template #header>
            <div class="relative z-10">
              <h3 class="text-xl font-bold leading-7 text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Quiz Settings</h3>
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Configure the behavior and rules for your quiz ⚙️</p>
            </div>
          </template>
          <div class="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
            <!-- Timer Settings -->
            <div class="col-span-2 group relative overflow-hidden flex flex-col gap-6 rounded-3xl border-2 border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-cyan-50/80 p-8 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl dark:border-emerald-500/30 dark:from-emerald-900/40 dark:via-teal-900/30 dark:to-cyan-900/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500/10 before:via-transparent before:to-cyan-500/10 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100">
              <div class="relative z-10">
                <label class="text-lg font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200 bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-200 dark:to-teal-300 bg-clip-text text-transparent">Timer Configuration</label>
                <p class="text-sm text-emerald-700 dark:text-emerald-300/90 mt-2">Choose between quiz timer or per-question timer ⏱️</p>
              </div>
              <div class="relative z-10 flex items-center justify-between gap-6">
                <span class="text-sm font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Timer Mode</span>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-emerald-700 dark:text-emerald-300">{{ form.use_per_question_timer ? 'Per Question' : 'Quiz Timer' }}</span>
                  <UToggle
                    v-model="form.use_per_question_timer"
                    class="scale-110"
                  />
                </div>
              </div>
            </div>

            <!-- Time Limit -->
            <UFormGroup v-if="!form.use_per_question_timer" label="Quiz Time Limit (minutes)" name="timer_minutes" class="space-y-4">
              <UInput
                v-model.number="form.timer_minutes"
                type="number"
                min="0"
                id="timer_minutes"
                placeholder="e.g., 10"
                :disabled="form.use_per_question_timer"
                class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm px-6 py-4 text-sm font-semibold shadow-xl shadow-slate-900/10 transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-emerald-400 dark:hover:border-slate-500/80"
              />
              <template #help>
                <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Set to 0 for no time limit ⏰</span>
              </template>
            </UFormGroup>

            <!-- Per Question Time Limit -->
            <UFormGroup v-if="form.use_per_question_timer" label="Time Per Question (seconds)" name="per_question_seconds" class="space-y-4">
              <UInput
                v-model.number="form.per_question_seconds"
                type="number"
                min="10"
                id="per_question_seconds"
                placeholder="e.g., 30"
                class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm px-6 py-4 text-sm font-semibold shadow-xl shadow-slate-900/10 transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-emerald-400 dark:hover:border-slate-500/80"
              />
              <template #help>
                <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Minimum 10 seconds per question ⚡</span>
              </template>
            </UFormGroup>

            <!-- Attempts Allowed -->
            <UFormGroup label="Attempts Allowed" name="attempts_allowed" class="space-y-4">
              <UInput
                v-model.number="form.attempts_allowed"
                type="number"
                min="0"
                id="attempts_allowed"
                placeholder="e.g., 1"
                class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm px-6 py-4 text-sm font-semibold shadow-xl shadow-slate-900/10 transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-emerald-400 dark:hover:border-slate-500/80"
              />
              <template #help>
                <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Set to 0 for unlimited attempts 🔄</span>
              </template>
            </UFormGroup>

            <!-- Shuffle Questions -->
            <div class="group relative overflow-hidden flex items-center justify-between rounded-2xl border-2 border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-yellow-50/80 p-6 shadow-xl shadow-amber-500/20 backdrop-blur-xl dark:border-amber-500/30 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div class="flex-1">
                <label for="shuffle_questions" class="font-bold text-amber-800 dark:text-amber-200 text-lg">Shuffle Questions</label>
                <p class="text-sm text-amber-700 dark:text-amber-300/90 mt-1">Randomize question order for each attempt 🎲</p>
              </div>
              <UToggle v-model="form.shuffle_questions" id="shuffle_questions" class="scale-110 ml-4" />
            </div>

            <!-- Shuffle Answers -->
            <div class="group relative overflow-hidden flex items-center justify-between rounded-2xl border-2 border-rose-200/60 bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-fuchsia-50/80 p-6 shadow-xl shadow-rose-500/20 backdrop-blur-xl dark:border-rose-500/30 dark:from-rose-900/40 dark:via-pink-900/30 dark:to-fuchsia-900/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div class="flex-1">
                <label for="shuffle_answers" class="font-bold text-rose-800 dark:text-rose-200 text-lg">Shuffle Answers</label>
                <p class="text-sm text-rose-700 dark:text-rose-300/90 mt-1">Randomize answer options for each question 🔀</p>
              </div>
              <UToggle v-model="form.shuffle_answers" id="shuffle_answers" class="scale-110 ml-4" />
            </div>

            <!-- Access Level -->
            <UFormGroup label="Access Level" name="access" class="space-y-4">
              <div class="relative z-50">
                <ClientOnly>
                  <USelectMenu
                      v-model="form.access"
                      id="access"
                      :options="[
                      { label: 'Free', value: 'free' },
                      { label: 'Premium', value: 'premium' },
                      { label: 'Paid', value: 'paid' }
                    ]"
                      class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-emerald-400 dark:hover:border-slate-500/80"
                  />
                </ClientOnly>
              </div>
            </UFormGroup>

            <!-- Visibility -->
              <UFormGroup label="Visibility" name="visibility" class="space-y-4">
              <div class="relative z-50">
                <ClientOnly>
                  <USelectMenu
                    v-model="form.visibility"
                    id="visibility"
                    :options="[
                      { label: 'Public', value: 'public' },
                      { label: 'Private', value: 'private' },
                      { label: 'Unlisted', value: 'unlisted' }
                    ]"
                    class="rounded-2xl border-2 border-slate-200/60 bg-white/90 backdrop-blur-sm transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 hover:border-slate-300/80 dark:border-slate-600/60 dark:bg-slate-800/80 dark:focus:border-emerald-400 dark:hover:border-slate-500/80"
                  />
                </ClientOnly>
              </div>
            </UFormGroup>
          </div>

          <div class="flex items-center justify-between pt-8">
            <div>
              <UButton
                variant="ghost"
                class="group rounded-2xl px-6 py-3 text-sm font-bold text-slate-500 transition-all duration-300 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60"
                @click="() => { /* noop - maybe revert to saved */ }"
              >
                <span class="flex items-center gap-2">
                  <span class="text-lg">↶</span>
                  Back
                </span>
              </UButton>
            </div>
            <div class="flex items-center gap-4">
              <UButton
                class="group rounded-2xl bg-gradient-to-r from-emerald-100/80 to-teal-50/80 px-8 py-3 font-bold text-emerald-700 shadow-xl shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20 dark:from-emerald-800/60 dark:to-teal-700/60 dark:text-emerald-200 border-2 border-emerald-200/60 dark:border-emerald-600/60"
                @click="saveSettings"
                :loading="isSubmitting"
                size="md"
              >
                <span class="flex items-center gap-2">
                  <span class="text-lg">💾</span>
                  Save Settings
                </span>
              </UButton>
              <UButton
                color="primary"
                class="group rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-10 py-3 font-bold text-white shadow-2xl shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl hover:shadow-purple-500/60 hover:scale-105"
                @click="() => nextTab('questions')"
                size="md"
              >
                <span class="flex items-center gap-2">
                  Next Step
                  <span class="text-lg">→</span>
                </span>
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Question Builder -->
      <div v-show="activeTab === 'questions'">
        <UCard class="group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl hover:shadow-indigo-500/20 dark:border-slate-700/40 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/80 before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/5 before:via-transparent before:to-blue-500/5 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100">
          <template #header>
            <div class="relative z-10">
              <h3 class="text-xl font-bold leading-7 text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Question Builder</h3>
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Add, edit and reorder questions for this quiz 🧠</p>
            </div>
          </template>
          <div class="relative z-10 space-y-8">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-cyan-50/80 border-2 border-indigo-200/60 shadow-xl shadow-indigo-500/20 backdrop-blur-xl dark:from-indigo-900/40 dark:via-blue-900/30 dark:to-cyan-900/40 dark:border-indigo-500/30">
              <div class="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Manage questions for this quiz 📝</div>
              <div class="flex flex-wrap items-center gap-3">
                <UButton
                  size="sm"
                  variant="outline"
                  class="group rounded-2xl border-2 border-indigo-200/60 bg-white/90 backdrop-blur-sm px-6 py-3 font-bold text-indigo-700 shadow-xl shadow-indigo-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-indigo-50/80 dark:border-indigo-600/60 dark:bg-slate-800/80 dark:text-indigo-200 dark:hover:bg-slate-700/60"
                  @click="saveAllQuestions"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-lg">💾</span>
                    Save All
                  </span>
                </UButton>
                <UButton
                  size="sm"
                  class="group rounded-2xl bg-gradient-to-r from-amber-100/80 to-orange-50/80 px-6 py-3 font-bold text-amber-700 shadow-xl shadow-amber-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:from-amber-800/60 dark:to-orange-700/60 dark:text-amber-200 border-2 border-amber-200/60 dark:border-amber-600/60"
                  @click="saveDraft"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-lg">📝</span>
                    Save Draft
                  </span>
                </UButton>
                <UButton
                  size="sm"
                  color="primary"
                  class="group rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-8 py-3 font-bold text-white shadow-2xl shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl hover:shadow-purple-500/60 hover:scale-105"
                  :loading="isSubmitting"
                  @click="submitQuiz"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-lg">🚀</span>
                    Publish Quiz
                  </span>
                </UButton>
              </div>
            </div>
            <QuestionBuilder
              v-model:questions="questions"
              :grade-id="form.grade_id"
              :subject-id="form.subject_id"
              :topic-id="form.topic_id"
              :disabled="!quizId"
              :grade-options="grades"
              :subject-options="filteredSubjects"
              :topic-options="filteredTopics"
              @save-question="saveQuestion"
            />
          </div>
        </UCard>
      </div>
    </div>

    <!-- Create Topic Modal -->
    <CreateTopicModal
      v-model="showCreateTopicModal"
      :grades="grades"
      :subjects="subjects"
      :default-grade-id="form.grade_id"
      :default-subject-id="form.subject_id"
      @created="onTopicCreated"
    />

    <!-- Mobile sticky actions -->
    <div class="fixed inset-x-0 bottom-0 z-50 sm:hidden">
      <div class="mx-auto max-w-5xl px-6 py-4 bg-gradient-to-r from-white/95 via-slate-50/90 to-white/95 backdrop-blur-2xl border-t-2 border-slate-200/60 shadow-2xl shadow-slate-900/20 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 dark:border-slate-700/60">
        <div class="flex items-center justify-between gap-4">
          <div class="text-sm font-bold text-slate-700 dark:text-slate-200">
            <span v-if="activeTab === 'details'" class="flex items-center gap-2">
              <span class="text-lg">📝</span>
              Save Details
            </span>
            <span v-else-if="activeTab === 'settings'" class="flex items-center gap-2">
              <span class="text-lg">⚙️</span>
              Save Settings
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="text-lg">🧠</span>
              Manage Questions
            </span>
          </div>
          <div class="flex items-center gap-3">
            <UButton
              v-if="activeTab === 'details'"
              class="group rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-6 py-3 font-bold text-white shadow-xl shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/60"
              @click="saveDetails"
              :loading="isSubmitting"
              :disabled="!isDetailsValid"
              size="md"
            >
              <span class="flex items-center gap-2">
                <span class="text-lg">💾</span>
                Save & Next
              </span>
            </UButton>
            <UButton
              v-else-if="activeTab === 'settings'"
              class="group rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-xl shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/60"
              @click="saveSettings"
              :loading="isSubmitting"
              size="md"
            >
              <span class="flex items-center gap-2">
                <span class="text-lg">💾</span>
                Save & Next
              </span>
            </UButton>
            <UButton
              v-else
              class="group rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-6 py-3 font-bold text-white shadow-xl shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/60"
              :loading="isSubmitting"
              @click="submitQuiz"
              size="md"
            >
              <span class="flex items-center gap-2">
                <span class="text-lg">🚀</span>
                Publish
              </span>
            </UButton>
          </div>
        </div>
      </div>
    </div>
    <!-- Desktop floating save button removed per user request -->
  </div>
</template>

<script setup>
definePageMeta({ layout: 'quiz-master' })
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
import QuestionBuilder from '~/components/quiz/QuestionBuilder.vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import UiSelectSkeleton from '~/components/ui/UiSelectSkeleton.vue'
import USelectMenuTeleport from '~/components/ui/USelectMenuTeleport.vue'
import CreateTopicModal from '~/components/modals/CreateTopicModal.vue'

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()
const api = useApi()
const { public: { apiBase } } = useRuntimeConfig()

const quizId = ref(route.params.id || null)


const initialForm = {
  title: '',
  description: '',
  grade_id: null,
  subject_id: null,
  topic_id: null,
  // Settings fields
  timer_minutes: 10,
  per_question_seconds: 30,
  use_per_question_timer: false,
  attempts_allowed: 1,
  shuffle_questions: true,
  shuffle_answers: true,
  access: 'free',
  visibility: { label: 'Public', value: 'public' },
}

const form = ref({ ...initialForm })

const questions = ref([])

const grades = ref([])
const subjects = ref([])
const topics = ref([])
const isSubmitting = ref(false)
const isSaving = ref(false)

const activeTab = ref('details')
const tabs = computed(() => [
  { name: 'details', label: 'Details', disabled: false },
  { name: 'settings', label: 'Settings', disabled: false },
  { name: 'questions', label: 'Questions', disabled: false }
])

const isDetailsValid = computed(() => {
  return form.value.title && form.value.grade_id && form.value.subject_id && form.value.topic_id
})

const filteredSubjects = computed(() => {
  if (!form.value.grade_id) return []
  return subjects.value.filter(subject => subject.grade_id === form.value.grade_id)
})

const filteredTopics = computed(() => {
  if (!form.value.subject_id) return []
  return topics.value.filter(topic => topic.subject_id === form.value.subject_id)
})

const topicsLoading = ref(false)
const subjectsLoading = ref(false)
const showCreateTopicModal = ref(false)

async function fetchInitialData() {
  try {
    const gradesRes = await fetch(`${apiBase}/api/grades`, { credentials: 'include' })
    if (gradesRes.ok) {
      const data = await gradesRes.json()
      grades.value = data.grades || data.data || []
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to load grades.' })
  }
}

async function fetchSubjectsByGrade(gradeId) {
  if (!gradeId) return
  subjectsLoading.value = true
  try {
    // Backend exposes /api/subjects with a grade filter, use that to avoid 404
    const res = await fetch(`${apiBase}/api/subjects?grade_id=${gradeId}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      // Normalize paginated or non-paginated responses into an array of subjects
      let list = []
      if (data.subjects) {
        // subjects may be a paginator object { current_page, data: [...] }
        list = Array.isArray(data.subjects) ? data.subjects : (data.subjects.data || [])
      } else if (Array.isArray(data)) {
        list = data
      } else if (data.data) {
        list = Array.isArray(data.data) ? data.data : (data.data.subjects || [])
      }
      subjects.value = list
    } else {
      // fallback: try fetching all subjects and filter client-side
      const allRes = await fetch(`${apiBase}/api/subjects`, { credentials: 'include' })
      if (allRes.ok) {
        const allData = await allRes.json()
        let list = []
        if (allData.subjects) {
          list = Array.isArray(allData.subjects) ? allData.subjects : (allData.subjects.data || [])
        } else if (Array.isArray(allData)) {
          list = allData
        } else if (allData.data) {
          list = Array.isArray(allData.data) ? allData.data : []
        }
        subjects.value = list.filter(s => s.grade_id === Number(gradeId))
      }
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to load subjects.' })
  } finally {
    subjectsLoading.value = false
  }
}

async function fetchTopicsBySubject(subjectId) {
  if (!subjectId) return
  topicsLoading.value = true
  try {
    const res = await fetch(`${apiBase}/api/subjects/${subjectId}/topics`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      topics.value = data.topics || data.data || []
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to load topics.' })
  } finally {
    topicsLoading.value = false
  }
}

// Watch for grade changes
watch(() => form.value.grade_id, async (newGradeId, oldGradeId) => {
  if (newGradeId !== oldGradeId) {
    form.value.subject_id = null
    form.value.topic_id = null
    subjects.value = []
    topics.value = []
    if (newGradeId) {
      await fetchSubjectsByGrade(newGradeId)
    }
  }
})

// Watch for subject changes
watch(() => form.value.subject_id, async (newSubjectId, oldSubjectId) => {
  if (newSubjectId !== oldSubjectId) {
    form.value.topic_id = null
    topics.value = []
    if (newSubjectId) {
      await fetchTopicsBySubject(newSubjectId)
    }
  }
})

async function saveSettings() {
  if (!quizId.value) {
    alert.push({ type: 'warning', message: 'Please save quiz details first.' })
    return
  }
  isSubmitting.value = true
  try {
    const res = await api.patchJson(`/api/quizzes/${quizId.value}`, {
      timer_minutes: form.value.use_per_question_timer ? 0 : form.value.timer_minutes,
      per_question_seconds: form.value.use_per_question_timer ? form.value.per_question_seconds : 0,
      use_per_question_timer: form.value.use_per_question_timer,
      attempts_allowed: form.value.attempts_allowed,
      shuffle_questions: form.value.shuffle_questions,
      shuffle_answers: form.value.shuffle_answers,
      access: form.value.access.value,
      visibility: form.value.visibility.value
    })

  if (!res.ok) throw new Error('Failed to save quiz settings')

  alert.push({ type: 'success', message: 'Settings saved successfully!' })
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  } finally {
    isSubmitting.value = false
  }
}

function nextTab(name) {
  if (!name) return
  activeTab.value = name
}

// Save or update a single question (sends to server if quiz exists)
async function saveQuestion(question) {
  if (!quizId.value) {
    alert.push({ type: 'warning', message: 'Please save quiz details first.' })
    return
  }
  try {
    const res = await api.postJson(`/api/quizzes/${quizId.value}/questions`, question)
    if (api.handleAuthStatus(res)) return
    if (!res.ok) throw new Error('Failed to save question')
    const data = await res.json().catch(()=>null)
    // Replace local question with server data where applicable
    const idx = questions.value.findIndex(q => q.uid === question.uid || q.id === question.id)
    if (idx !== -1 && data?.question) questions.value.splice(idx,1,data.question)
    else if (data?.question) questions.value.push(data.question)
    alert.push({ type: 'success', message: 'Question saved' })
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  }
}

// Save all questions in bulk
async function saveAllQuestions() {
  if (!quizId.value) { alert.push({ type: 'warning', message: 'Please save quiz details first.' }); return }
  try {
    const res = await api.putJson(`/api/quizzes/${quizId.value}/questions`, { questions: questions.value })
    if (api.handleAuthStatus(res)) return
    if (!res.ok) throw new Error('Failed to save questions')
    alert.push({ type: 'success', message: 'All questions saved' })
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  }
}

async function saveDetails() {
  if (!isDetailsValid.value) {
    alert.push({ type: 'warning', message: 'Please fill in all quiz details.' })
    return
  }
  isSubmitting.value = true
  try {
    const res = await api.postJson('/api/quizzes', form.value)
    if (api.handleAuthStatus(res)) {
      alert.push({ type: 'warning', message: 'Session expired — please sign in again' })
      return
    }
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to create quiz.')

  quizId.value = data.quiz.id
  alert.push({ type: 'success', message: 'Quiz details saved!' })
  // Update URL without reloading page
  router.replace({ path: `/quiz-master/quizzes/create`, query: { id: quizId.value } })
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await fetchInitialData()

  // Pre-populate from URL query parameters
  const { grade_id, subject_id, topic_id, id } = route.query;
  if (grade_id) form.value.grade_id = Number(grade_id);
  if (subject_id) form.value.subject_id = Number(subject_id);
  if (topic_id) form.value.topic_id = Number(topic_id);
  if (id) {
    quizId.value = id
    // Here you would fetch the quiz data if it's an existing draft
    // For now, we just enable the questions tab
    activeTab.value = 'questions'
  }
})

async function submitQuiz() {
  isSubmitting.value = true
  try {
    const payload = {
      ...form.value,
      questions: questions.value,
      status: 'published' // Or whatever your backend expects
    }
    const res = await api.patchJson(`/api/quizzes/${quizId.value}`, payload)

    if (api.handleAuthStatus(res)) { alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); return }

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to publish quiz.')

    alert.push({ type: 'success', message: 'Quiz created successfully!' })
    // Redirect to the edit page to add questions
    router.push(`/quiz-master/quizzes/${data.quiz.id}/edit`)
  } catch (e) {
    alert.push({ type: 'error', message: e.message })
  } finally {
    isSubmitting.value = false
  }
}

function saveDraft() {
  // Logic to save draft
  alert.push({ type: 'info', message: 'Draft saved (not implemented)' })
}

function previewDraft() {
  if (!quizId.value) {
    alert.push({ type: 'warning', message: 'Please save quiz details first.' })
    return
  }
  const draftData = {
    form: form.value,
    questions: questions.value
  }
  try {
    sessionStorage.setItem('quiz:draft', JSON.stringify(draftData))
    router.push('/quiz-master/quizzes/preview')
  } catch (e) {
    alert.push({ type: 'error', message: 'Could not save draft for preview.' })
  }
}

function onTopicCreated(newTopic) {
  // Add the new topic to the topics list
  topics.value.push(newTopic)
  // Set it as selected
  form.value.topic_id = newTopic.id
  // Show success message
  alert.push({ type: 'success', message: 'Topic created successfully!' })
}

</script>
