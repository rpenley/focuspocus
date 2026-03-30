<template>
  <div class="min-h-screen p-4 md:p-6">
    <div
      class="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]"
    >
      <AppSidebar class="min-h-[18rem]" />

      <main class="grid min-h-full auto-rows-min gap-4">
        <NuxtRouteAnnouncer />
        <slot />
      </main>
    </div>
  </div>
</template>
