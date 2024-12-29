<template lang="pug">
v-app
  AppHeader
    router-view(name="toolbar")

  v-main
    router-view

  AppFooter
</template>
