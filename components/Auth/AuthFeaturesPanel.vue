<template>
  <div class="h-full w-full bg-gradient-to-br from-brand-600 to-brand-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
       <div class="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
       <div class="absolute bottom-10 left-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <div class="relative z-10">
      <NuxtLink to="/" class="inline-flex items-center gap-2 mb-8 group">
          <div class="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span class="font-medium">Back to Home</span>
      </NuxtLink>
      
      <div class="flex items-center gap-3 mb-6">
         <img src="/logo/modeh-logo-white.png" alt="Modeh Logo" class="h-10 w-auto" />
      </div>
      
      <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
        Master your skills with Modeh
      </h1>
      <p class="text-brand-100 text-lg max-w-md">
        Join a community of learners and educators. Challenge yourself, compete with others, and track your progress.
      </p>
    </div>

    <!-- Features List -->
    <div class="relative z-10 mt-8 space-y-6">
      <div v-for="(feature, index) in features" :key="index" class="flex gap-4 items-start animate-fade-in" :style="{ animationDelay: `${index * 100}ms` }">
        <div class="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <Icon :name="feature.icon" class="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h3 class="font-semibold text-lg text-white">{{ feature.title }}</h3>
          <p class="text-brand-100/80 text-sm leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- Footer Stats / Social Proof -->
    <div class="relative z-10 mt-12 pt-8 border-t border-white/10">
       <div class="flex items-center gap-4">
          <div class="flex -space-x-3">
             <template v-for="i in 4" :key="i">
                <div class="w-10 h-10 rounded-full border-2 border-brand-800 bg-gray-200 overflow-hidden">
                   <img :src="`https://i.pravatar.cc/100?img=${i + 10}`" alt="User" class="w-full h-full object-cover" />
                </div>
             </template>
          </div>
          <div class="text-sm">
             <div class="font-bold text-white">10k+ Learners</div>
             <div class="text-brand-200">Joined this month</div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
const features = [
  {
    title: 'Daily Challenges',
    description: 'Fresh quizzes every day to keep your mind sharp and build a learning habit.',
    icon: 'heroicons:calendar-days'
  },
  {
    title: 'Group Battles',
    description: 'Compete with friends or classmates in real-time group quiz battles.',
    icon: 'heroicons:users'
  },
  {
    title: 'Tournaments',
    description: 'Join scalable tournaments, climb the leaderboard, and win exciting rewards.',
    icon: 'heroicons:trophy'
  },
  {
    title: 'Detailed Analytics',
    description: 'Track your growth with in-depth performance insights and progress reports.',
    icon: 'heroicons:chart-bar'
  }
]
</script>

<style scoped>
.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
