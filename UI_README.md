This project uses Tailwind CSS (via @nuxtjs/tailwindcss). UI improvements and lightweight "Nuxt UI" patterns:

- Use Tailwind utility classes for primary styling.
- Use HeadlessUI (`@headlessui/vue`) for accessible UI primitives (dialogs, menus, popovers). You already have it in package.json.
- Components:
  - `components/SkeletonCard.vue` - small card-shaped skeleton
  - `components/SkeletonGrid.vue` - grid of `SkeletonCard` components, accepts `count` prop

Usage examples:

- Show skeletons while loading subjects/topics/quizzes:

```vue
<template>
  <div>
    <div v-if="loading">
      <SkeletonGrid :count="6" />
    </div>
    <div v-else>
      <div v-for="s in subjects" :key="s.id">...</div>
    </div>
  </div>
</template>
```

- Use HeadlessUI Dialog for modals and disclosure components for filters.

Notes:
- If you want a full component library with richer built-in UI (components, skeletons, themes), consider adding one of:
  - Nuxt UI libraries (Nuxt Labs components) depending on Nuxt version
  - Vuetify (Vue-specific, heavyweight)
  - Tailwind UI (commercial) or free component sets

If you'd like, I can:
- Add skeletons to specific public pages (subjects, topics, quizzes)
- Add a small Header/Footer layout component using HeadlessUI and Heroicons
- Integrate a lightweight component library such as `@nuxt/ui` or `@nuxtlabs/ui` if you want a more opinionated set of components

Tell me which pages you'd like upgraded first and I will wire skeletons + a layout.
