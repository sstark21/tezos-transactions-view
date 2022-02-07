<template>
  <v-app>
    <v-main>
      <TransactionsView />
    </v-main>
  </v-app>
</template>

<script>
import TransactionsView from "./components/TransactionsView";

export default {
  name: "App",

  components: {
    TransactionsView,
  },

  data: () => ({
    //
  }),
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>