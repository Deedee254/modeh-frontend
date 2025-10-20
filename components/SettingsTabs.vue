<template>
  <div>
    <!-- Mobile dropdown -->
    <div class="sm:hidden mb-4">
      <label for="settings-tabs" class="sr-only">Select a tab</label>
      <select id="settings-tabs" name="tabs" class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" @change="selectTab($event.target.value)">
        <option v-for="tab in tabs" :key="tab.key" :value="tab.key" :selected="tab.key === active">{{ tab.label }}</option>
      </select>
    </div>

    <!-- Desktop tabs -->
    <div role="tablist" aria-label="Settings Tabs" class="hidden sm:flex flex-nowrap gap-2 mb-6 sticky top-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-2 z-10 overflow-x-auto">
      <button v-for="tab in tabs" :key="tab.key" :id="`tab-${tab.key}`" role="tab"
        :aria-selected="tab.key === active" :aria-controls="`panel-${tab.key}`"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border inline-flex items-center gap-2 w-full sm:w-auto',
          tab.key === active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'
        ]"
        @click="selectTab(tab.key)">
        <span v-if="tab.icon" :class="['w-4 h-4 inline-block', tab.key === active ? 'text-white' : 'text-slate-600']" aria-hidden="true">
          <UIcon :name="tab.icon" />
        </span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div>
      <section v-for="tab in tabs" :key="tab.key" role="tabpanel"
        v-show="tab.key === active" :id="`panel-${tab.key}`" :aria-labelledby="`tab-${tab.key}`"
        class="p-4">
        <component :is="tab.component" v-if="tab.component" @saved="onSaved" @error="onError" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserRole } from '~/composables/useUserRole'
import { getSettingsTabs } from '~/utils/getSettingsTabs'

import { defineAsyncComponent } from 'vue'

const props = defineProps({
  initial: { type: String, default: 'profile' }
})

const { isQuizMaster, isquizee } = useUserRole()

const componentMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  profile: defineAsyncComponent(() => import('~/components/settings/ProfileTab.vue')),
  security: defineAsyncComponent(() => import('~/components/settings/SecurityTab.vue')),
  notifications: defineAsyncComponent(() => import('~/components/settings/NotificationsTab.vue')),
  payouts: defineAsyncComponent(() => import('~/components/settings/PayoutsTab.vue')),
  billing: defineAsyncComponent(() => import('~/components/settings/BillingTab.vue')),
}

const tabs = computed(() => {
  const defs = getSettingsTabs({ isQuizMaster: isQuizMaster.value, isquizee: isquizee.value })
  return defs.map(d => ({ ...d, component: componentMap[d.key] }))
})

const active = ref(props.initial)
function selectTab(key: string) { active.value = key }
function onSaved(_payload: any) { /* forward event or show global alert */ }
function onError(_err: any) { /* show error */ }
</script>

<style scoped>
/* tiny transitions */
[role="tabpanel"]{transition:opacity .18s ease}
</style>