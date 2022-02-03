<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/tezos-xtz-logo.svg')"
          class="my-3 row-pointer"
          contain
          height="200"
          @click="goToTzKT"
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
        <v-text-field
          v-model="textField"
          label="User address"
          solo
          clearable
          @click:clear="clear"
        >
        </v-text-field>
        <v-btn
          class="ml-6"
          height="48"
          :disabled="loading"
          large
          color="info"
          @click="checkWallet"
        >
          Check
        </v-btn>
      </v-col>
    </v-row>
    <v-row align="center" justify="space-around">
      <v-progress-circular
        v-if="loading && !items.length"
        indeterminate
        color="primary"
      ></v-progress-circular>
      <v-card
        class="mx-auto"
        width="970"
        scrollable
        tile
        v-if="items.length"
        transition="slide-x-transition"
      >
        <v-virtual-scroll
          :bench="benched"
          :items="items"
          height="500"
          item-height="100%"
          @scroll.native="scrolling"
        >
          <template v-slot:default="{ item }">
            <v-list-item
              two-line
              :key="item.id"
              v-ripple="{ class: `success--text` }"
              class="row-pointer"
              @click="rowClick(item.hash)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ senderOrInitiator(item) }}
                  <v-icon color="blue darken-2"> mdi-arrow-right </v-icon>
                  {{ item.target.alias || item.target.address }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Secondary line text Lorem ipsum dolor sit amet,
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  consectetur adipiscing elit.
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-virtual-scroll>
      </v-card>
    </v-row>
  </v-container>
</template>



<script>
/* TODO
  Панель навигации
  Пришлось увеличить кнопку до 48рх, подумать как избежать такого
  Тень на инпуте и кнопках разная, исправить
  Правый скролл
  Написать хороший Readme c заданием
  Вычистить мусор
*/

import Service from "../services/request-service";

export default {
  name: "TransactionsView",
  data() {
    return {
      textField: "tz1Yz97pBfZmVvpPy9AAXHSocWM7Vb7XKRm3",
      items: [],
      itemsPerPage: 10,
      page: 0,
      benched: 0,
      loading: false,
    };
  },
  methods: {
    clear() {
      this.$set(this, "textField", "");
      this.$set(this, "items", []);
      this.$set(this, "itemsPerPage", 10);
      this.$set(this, "page", 0);
      this.$set(this, "benched", 0);
    },
    getTransactions(method) {
      this.$set(this, "loading", true);

      Service.getWalletTransactions(
        this.textField,
        this.itemsPerPage,
        this.page
      )
        .then((res) => {
          if (method === "PUT") this.$set(this, "items", res.data);
          if (method === "PATCH")
            this.$set(this, "items", [...this.items, ...res.data]);
          this.$set(this, "loading", false);
        })
        .catch(() => {
          console.log("Something wrong");
          this.$set(this, "loading", false);
        });
    },
    checkWallet() {
      this.getTransactions("PUT");
    },
    scrolling(event) {
      const element = event.currentTarget || event.target;
      if (
        element &&
        element.scrollHeight - element.scrollTop === element.clientHeight
      ) {
        let pageCount = this.items.length / this.itemsPerPage;
        this.$set(this, "page", pageCount);

        this.getTransactions("PATCH");
      }
    },
    rowClick(hash) {
      const url = `https://tzkt.io/${hash}`;
      window.open(url, "_blank").focus();
    },
    goToTzKT() {
      window.open("https://tzkt.io/", "_blank").focus();
    },
    senderOrInitiator(item) {
      const { sender, initiator } = item;

      let currentSender = initiator ? initiator.alias : sender.alias;
      return currentSender;
    },
  },
  computed: {
    columns() {
      return [
        { text: "Hash", value: "hash" },
        { text: "Amount", value: "amount" },
      ];
    },

    ripple() {
      return {
        color: "primary--text",
      };
    },
  },
};
</script>

<style>
.row-pointer {
  cursor: pointer;
}
</style>