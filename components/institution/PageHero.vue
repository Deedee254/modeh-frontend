<script setup lang="ts">
interface ActionButton {
  label: string
  icon?: string
  href?: string
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
}

interface Props {
  title: string
  description?: string
  actions?: ActionButton[]
  theme?: 'green' | 'blue' | 'purple' | 'emerald'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'green'
})

const themeConfig = {
  green: {
    bg: 'from-green-50 via-emerald-50 to-teal-50',
    darkBg: 'dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20',
    border: 'border-green-200',
    darkBorder: 'dark:border-green-800/50',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    darkGradient: 'dark:from-green-400 dark:via-emerald-400 dark:to-teal-400'
  },
  blue: {
    bg: 'from-blue-50 via-indigo-50 to-purple-50',
    darkBg: 'dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20',
    border: 'border-blue-200',
    darkBorder: 'dark:border-blue-800/50',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    darkGradient: 'dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400'
  },
  purple: {
    bg: 'from-purple-50 via-pink-50 to-rose-50',
    darkBg: 'dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20',
    border: 'border-purple-200',
    darkBorder: 'dark:border-purple-800/50',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    darkGradient: 'dark:from-purple-400 dark:via-pink-400 dark:to-rose-400'
  },
  emerald: {
    bg: 'from-emerald-50 via-teal-50 to-cyan-50',
    darkBg: 'dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20',
    border: 'border-emerald-200',
    darkBorder: 'dark:border-emerald-800/50',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    darkGradient: 'dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400'
  }
}

const buttonVariantConfig = {
  primary: {
    bg: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600',
    text: 'text-white',
    border: ''
  },
  secondary: {
    bg: 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700',
    text: 'text-gray-900 dark:text-white',
    border: 'border border-gray-300 dark:border-slate-600'
  },
  outline: {
    bg: 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800/50',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border border-gray-300 dark:border-slate-600'
  }
}

const config = themeConfig[props.theme as keyof typeof themeConfig]
</script>

<template>
  <div :class="`bg-gradient-to-br ${config.bg} ${config.darkBg} px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b ${config.border} ${config.darkBorder}`">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <!-- Title & Description -->
        <div class="flex-1">
          <h1 :class="`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`">
            {{ title }}
          </h1>
          <p v-if="description" class="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-3xl">
            {{ description }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div v-if="actions && actions.length" class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <template v-for="(action, idx) in actions" :key="idx">
            <!-- Link Button -->
            <NuxtLink
              v-if="action.to || action.href"
              :to="action.to || action.href"
              :class="`
                inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium 
                transition-colors duration-200 whitespace-nowrap text-sm
                ${buttonVariantConfig[action.variant || 'primary'].bg}
                ${buttonVariantConfig[action.variant || 'primary'].text}
                ${buttonVariantConfig[action.variant || 'primary'].border}
                disabled:opacity-50 disabled:cursor-not-allowed
              `"
            >
              <span v-if="action.icon" class="text-lg">{{ action.icon }}</span>
              <span>{{ action.label }}</span>
            </NuxtLink>

            <!-- Button -->
            <button
              v-else
              :disabled="action.loading"
              :class="`
                inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium 
                transition-colors duration-200 whitespace-nowrap text-sm
                ${buttonVariantConfig[action.variant || 'primary'].bg}
                ${buttonVariantConfig[action.variant || 'primary'].text}
                ${buttonVariantConfig[action.variant || 'primary'].border}
                disabled:opacity-50 disabled:cursor-not-allowed
              `"
              @click="action.onClick?.()"
            >
              <span v-if="action.icon" class="text-lg">{{ action.icon }}</span>
              <span>{{ action.loading ? 'Loading...' : action.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
