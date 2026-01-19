<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Hero Section -->
    <PageHero
      :flush="true"
      title="Account Settings"
      description="Manage your profile, security, and preferences."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Settings', current: true }]"
    >
      <template #eyebrow>Quiz-master tools</template>
    </PageHero>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tab Navigation Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm mb-6 overflow-hidden">
        <!-- Mobile dropdown -->
        <div class="sm:hidden p-4">
          <label for="settings-tabs" class="sr-only">Select a tab</label>
          <select 
            id="settings-tabs" 
            name="tabs" 
            class="block w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 px-4 py-2 text-sm" 
            @change="selectTab(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="tab in tabs" :key="tab.key" :value="tab.key" :selected="tab.key === active">{{ tab.label }}</option>
          </select>
        </div>

        <!-- Desktop tabs -->
        <div role="tablist" aria-label="Settings Tabs" class="hidden sm:flex flex-wrap gap-1 p-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <button 
            v-for="tab in tabs" 
            :key="tab.key" 
            :id="`tab-${tab.key}`" 
            role="tab"
            :aria-selected="tab.key === active" 
            :aria-controls="`panel-${tab.key}`"
            :class="[
              'px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap',
              tab.key === active 
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                : 'bg-transparent text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
            ]"
            @click="selectTab(tab.key)"
          >
            <span v-if="tab.icon" class="w-4 h-4" aria-hidden="true">
              <UIcon :name="tab.icon" />
            </span>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <section 
          v-for="tab in tabs" 
          :key="tab.key" 
          role="tabpanel"
          v-show="tab.key === active" 
          :id="`panel-${tab.key}`" 
          :aria-labelledby="`tab-${tab.key}`"
          class="p-6 sm:p-8"
        >
          <ClientOnly>
            <component :is="tab.component" v-if="tab.component" @saved="onSaved" @error="onError" />
          </ClientOnly>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SettingsTabs from '~/components/SettingsTabs.vue'
import PageHero from '~/components/ui/PageHero.vue'
import { useUserRole } from '~/composables/useUserRole'
import { getSettingsTabs } from '~/utils/getSettingsTabs'
import { defineAsyncComponent } from 'vue'
import ProfileTab from '~/components/settings/ProfileTab.vue'

// Use the quiz-master layout for settings page
definePageMeta({ layout: 'quiz-master', title: 'Account settings' })

useHead({
  title: 'Account settings'
})

const { isQuizMaster, isQuizee } = useUserRole()

const componentMap: Record<string, any> = {
  profile: ProfileTab,
  security: defineAsyncComponent(() => import('~/components/settings/SecurityTab.vue')),
  notifications: defineAsyncComponent(() => import('~/components/settings/NotificationsTab.vue')),
  payouts: defineAsyncComponent(() => import('~/components/settings/PayoutsTab.vue')),
  billing: defineAsyncComponent(() => import('~/components/settings/BillingTab.vue')),
}

const tabs = computed(() => {
  const defs = getSettingsTabs({ isQuizMaster: isQuizMaster.value, isQuizee: isQuizee.value })
  return defs.map(d => ({ ...d, component: componentMap[d.key] }))
})

const active = ref('profile')

function selectTab(key: string) { 
  active.value = key 
}

function onSaved(_payload: any) { 
  // forward event or show global alert 
}

function onError(_err: any) { 
  // show error 
}
</script>

<style scoped>
[role="tabpanel"] {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
