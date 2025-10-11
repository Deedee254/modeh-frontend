<template>
  <div>
    <!-- Sticky tab header on desktop -->
    <div role="tablist" aria-label="Settings Tabs" class="flex flex-nowrap gap-2 mb-6 sticky top-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-2 z-10 overflow-x-auto">
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
        v-show="tab.key === active" :id="`panel-${tab.key}`" :aria-labelledby="`tab-${tab.key}`">
        <div class="p-4">
          <component :is="tab.component" v-if="tab.component" @saved="onSaved" @error="onError" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserRole } from '~/composables/useUserRole'
import { getSettingsTabs } from '~/utils/getSettingsTabs'

// Lazy-load lightweight tab components — replace with real implementations later
const ProfileTab = () => import('~/components/settings/ProfileTab.vue').catch(() => ({ template: '<div class="p-4">Profile tab placeholder</div>' }))
const SecurityTab = () => import('~/components/settings/SecurityTab.vue').catch(() => ({ template: '<div class="p-4">Security tab placeholder</div>' }))
const NotificationsTab = () => import('~/components/settings/NotificationsTab.vue').catch(() => ({ template: '<div class="p-4">Notifications tab placeholder</div>' }))
const PayoutsTab = () => import('~/components/settings/PayoutsTab.vue').catch(() => ({ template: '<div class="p-4">Payouts tab placeholder</div>' }))
const BillingTab = () => import('~/components/settings/BillingTab.vue').catch(() => ({ template: '<div class="p-4">Billing tab placeholder</div>' }))

const props = defineProps({
  initial: { type: String, default: 'profile' }
})

const { isquiz-master, isquizee } = useUserRole()

const tabs = computed(() => {
  const defs = getSettingsTabs({ isquiz-master: isquiz-master.value, isquizee: isquizee.value })
  const map: Record<string, any> = {
    profile: ProfileTab(),
    security: SecurityTab(),
    notifications: NotificationsTab(),
    payouts: PayoutsTab(),
    billing: BillingTab()
  }
  return defs.map(d => ({ key: d.key, label: d.label, icon: d.icon, component: map[d.key] }))
})

const active = ref(props.initial)
function selectTab(key: string) { active.value = key }
function onSaved(payload: any) { /* forward event or show global alert */ }
function onError(err: any) { /* show error */ }
</script>

<style scoped>
/* tiny transitions */
[role="tabpanel"]{transition:opacity .18s ease}
</style>
