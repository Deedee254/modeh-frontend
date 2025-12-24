<template>
   <section class="py-24 bg-gradient-to-tr from-[#800020]/8 via-white to-[#800020]/4 relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <!-- Left Side: Content -->
        <div>
           <span class="inline-block py-1.5 px-4 rounded-full bg-[#800020]/10 text-[#800020] text-sm font-bold tracking-wide uppercase mb-6">
             For Institutions
           </span>
           <h2 class="text-3xl md:text-5xl font-bold text-[#800020] mb-6 leading-tight">
             Empower Your School with Digital Assessments
           </h2>
           <p class="text-xl text-muted-foreground mb-8 leading-relaxed">
             Manage students, track performance across grades, and create a unified learning environment under your brand.
           </p>

           <ul class="space-y-6">
             <li v-for="(item, i) in benefits" :key="i" class="flex gap-4 items-start">
               <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#800020]/20 text-[#800020] flex items-center justify-center mt-1">
                 <Icon name="heroicons:check" class="w-5 h-5" />
               </div>
               <div>
                  <h4 class="text-lg font-bold text-foreground">{{ item.title }}</h4>
                  <p class="text-muted-foreground mt-1">{{ item.desc }}</p>
               </div>
             </li>
           </ul>

           <div class="mt-10">
              <NuxtLink to="/register?role=institution-manager" class="inline-flex items-center gap-2 text-[#800020] font-bold hover:gap-3 transition-all">
                 <span>Register your Institution</span>
                 <Icon name="heroicons:arrow-right" class="w-5 h-5" />
              </NuxtLink>
           </div>
        </div>

        <!-- Right Side: Visual/Graphic -->
        <div class="relative">
           <div class="absolute -inset-4 bg-gradient-to-tr from-[#800020] to-[#800020]/50 rounded-[2rem] opacity-20 blur-2xl"></div>
           <div class="relative bg-card rounded-[2rem] p-8 border border-border shadow-2xl">
              <!-- Mock Interface for Dashboard -->
              <div class="bg-background rounded-xl shadow-inner overflow-hidden border border-border mb-6">
                 <div class="flex items-center gap-2 p-4 border-b border-border">
                    <div class="w-3 h-3 rounded-full bg-red-400"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div class="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div class="p-6 space-y-4">
                    <div class="flex justify-between items-end">
                       <div>
                          <div class="h-2 w-24 bg-muted rounded mb-2"></div>
                          <div class="h-8 w-16 bg-[#800020]/20 rounded"></div>
                       </div>
                       <div class="h-12 w-32 bg-[#800020]/10 text-[#800020] text-xs flex items-center justify-center rounded font-mono">
                          +12% vs last week
                       </div>
                    </div>
                    
                    <!-- Fake Chart -->
                    <div class="h-32 flex items-end justify-between gap-2">
                       <div class="w-full bg-[#800020]/10 rounded-t-lg h-[40%]"></div>
                       <div class="w-full bg-[#800020]/20 rounded-t-lg h-[60%]"></div>
                       <div class="w-full bg-[#800020]/30 rounded-t-lg h-[50%]"></div>
                       <div class="w-full bg-[#800020]/40 rounded-t-lg h-[80%]"></div>
                       <div class="w-full bg-[#800020]/60 rounded-t-lg h-[65%]"></div>
                       <div class="w-full bg-[#800020] rounded-t-lg h-[90%] shadow-lg shadow-[#800020]/20"></div>
                    </div>
                 </div>
              </div>

              <div class="flex gap-4">
                 <div class="flex-1 bg-background p-4 rounded-xl shadow-sm border border-border">
                    <div class="h-8 w-8 bg-blue-100 rounded-lg mb-2 flex items-center justify-center text-blue-600">
                       <Icon name="heroicons:users" class="w-5 h-5" />
                    </div>
                    <div class="h-3 w-20 bg-muted rounded"></div>
                 </div>
                 <div class="flex-1 bg-background p-4 rounded-xl shadow-sm border border-border">
                    <div class="h-8 w-8 bg-purple-100 rounded-lg mb-2 flex items-center justify-center text-purple-600">
                       <Icon name="heroicons:academic-cap" class="w-5 h-5" />
                    </div>
                    <div class="h-3 w-20 bg-muted rounded"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const benefits = [
  {
    title: 'Centralized Dashboard',
    desc: 'Monitor student progress, quiz performance, and teacher activity in one place.'
  },
  {
    title: 'Brand Integration',
    desc: 'Customize the experience with your institution\'s logo and colors.'
  },
  {
    title: 'Bulk Management',
    desc: 'Easily import students and assign them to classes or grades.'
  }
]
</script>
