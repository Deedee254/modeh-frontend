<template>
  <section class="py-24 bg-background relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
          One Platform, Two Journeys
        </h2>
        <p class="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Modeh brings together ambitious learners and expert educators. Choose your path and start achieving your goals.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Learners Column -->
        <div class="relative group rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-card border border-border shadow-xl hover:shadow-2xl transition-all duration-500">
           
           <div class="relative z-10 h-full flex flex-col">
              <div class="mb-8">
                <span class="inline-block py-1 px-3 rounded-full bg-[#800020]/10 text-[#800020] text-sm font-bold tracking-wide uppercase mb-4">
                  For Learners
                </span>
                <h3 class="text-3xl font-bold text-card-foreground mb-4">Master Any Subject</h3>
                <p class="text-muted-foreground leading-relaxed">
                  Join a community of learners. Compete in daily challenges, track your growth, and prove your skills.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                 <div class="bg-background/50 p-4 rounded-2xl backdrop-blur-sm border border-border">
                    <Icon name="heroicons:trophy" class="w-8 h-8 text-[#800020] mb-2" />
                    <h4 class="font-bold text-foreground">Compete & Win</h4>
                    <p class="text-sm text-muted-foreground">Daily leaderboards & prizes</p>
                 </div>
                 <div class="bg-background/50 p-4 rounded-2xl backdrop-blur-sm border border-border">
                    <Icon name="heroicons:chart-bar" class="w-8 h-8 text-[#800020] mb-2" />
                    <h4 class="font-bold text-foreground">Track Progress</h4>
                    <p class="text-sm text-muted-foreground">Detailed performance analytics</p>
                 </div>
                 <div class="bg-background/50 p-4 rounded-2xl backdrop-blur-sm border border-border">
                    <Icon name="heroicons:users" class="w-8 h-8 text-[#800020] mb-2" />
                    <h4 class="font-bold text-foreground">Live Battles</h4>
                    <p class="text-sm text-muted-foreground">Real-time multiplayer quizzes</p>
                 </div>
                 <div class="bg-background/50 p-4 rounded-2xl backdrop-blur-sm border border-border">
                    <Icon name="heroicons:sparkles" class="w-8 h-8 text-[#800020] mb-2" />
                    <h4 class="font-bold text-foreground">AI Insights</h4>
                    <p class="text-sm text-muted-foreground">Personalized study tips</p>
                 </div>
              </div>

              <div class="mt-auto">
                 <NuxtLink to="/register?role=quizee" class="block w-full py-4 rounded-xl bg-[#800020] text-white font-bold text-center hover:bg-[#800020]/90 transition-colors shadow-lg">
                    Start Learning Free
                 </NuxtLink>
              </div>
           </div>
        </div>

        <!-- Educators Column -->
        <div class="relative group rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-[#800020] border border-[#800020] shadow-xl hover:shadow-2xl transition-all duration-500 text-white">
           
           <div class="relative z-10 h-full flex flex-col">
              <div class="mb-8">
                <span class="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-sm font-bold tracking-wide uppercase mb-4 border border-white/20">
                  For Educators
                </span>
                <h3 class="text-3xl font-bold mb-4">Empower & Earn</h3>
                <p class="text-white/80 leading-relaxed">
                  Create engaging assessments, reach a global audience, and monetize your expertise.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                 <div class="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Icon name="heroicons:pencil-square" class="w-8 h-8 text-white mb-2" />
                    <h4 class="font-bold">Rich Editor</h4>
                    <p class="text-sm text-white/70">Support for math, code, & media</p>
                 </div>
                 <div class="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Icon name="heroicons:globe-alt" class="w-8 h-8 text-white mb-2" />
                    <h4 class="font-bold">Global Reach</h4>
                    <p class="text-sm text-white/70">Publish to thousands of users</p>
                 </div>
                 <div class="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Icon name="heroicons:currency-dollar" class="w-8 h-8 text-white mb-2" />
                    <h4 class="font-bold">Monetize</h4>
                    <p class="text-sm text-white/70">Paid quizzes & subscriptions</p>
                 </div>
                 <div class="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Icon name="heroicons:presentation-chart-line" class="w-8 h-8 text-white mb-2" />
                    <h4 class="font-bold">Deep Analytics</h4>
                    <p class="text-sm text-white/70">Understand student performance</p>
                 </div>
              </div>

              <div class="mt-auto">
                 <NuxtLink to="/register?role=quiz-master" class="block w-full py-4 rounded-xl bg-white text-[#800020] font-bold text-center hover:bg-gray-100 transition-colors shadow-lg">
                    Become a Quiz Master
                 </NuxtLink>
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
