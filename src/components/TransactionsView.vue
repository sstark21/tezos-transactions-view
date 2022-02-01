<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/tezos-xtz-logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>
      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to <br />
          Tezos Transactions Viewer
        </h1>
      </v-col>
    </v-row>
    <v-row align="center" justify="space-around">
      <v-col cols="10" class="d-flex">
        <v-text-field v-model="textField" label="Solo" solo clearable>
        </v-text-field>
        <v-btn
          class="ml-6"
          height="48"
          :loading="loading"
          :disabled="loading"
          large
          color="info"
          @click="loader = 'loading'"
        >
          Check
        </v-btn>
      </v-col>
    </v-row>
    <v-row align="center" justify="space-around">
      <v-data-table
        cols="12"
        :headers="columns"
        :items="tableData"
        :items-per-page="5"
        class="elevation-1"
      ></v-data-table>
    </v-row>
  </v-container>
</template>



<script>

/*
TODO
  Заголовок вкладки
  Иконка влкладки
  Панель навигации
  Пришлось увеличить кнопку до 48рх, подумать как избежать такого
  Тень на инпуте и кнопках разная, исправить
  Правый скролл
  Настроить таблицу с пагинацией
  По клику таблицы переходить на другую страницу
  Вычистить мусор
*/

import Service from "../services/request-service";

export default {
  name: "TransactionsView",
  data() {
    return {
      textField: "tz1Yz97pBfZmVvpPy9AAXHSocWM7Vb7XKRm3",
      loading: false,
      loader: null,
      tableData: [],
    };
  },
  methods: {},
  computed: {
    columns() {
      return [
        { text: "Block", value: "block" },
        { text: "Amount", value: "amount" },
      ];
    },
  },
  watch: {
    loader() {
      const x = this.loader;
      this[x] = !this[x];

      setTimeout(() => (this[x] = false), 3000);
      Service.getWalletTransactions(this.textField).then((res) => {
        this.$set(this, "tableData", res.data);
        console.log("tableData", this.tableData);
      });
      this.loader = null;
    },
  },
};
</script>

<style>
</style>