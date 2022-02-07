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
                            three-line
                            :key="item.id"
                            v-ripple="{ class: `success--text` }"
                            class="row-pointer"
                            @click="rowClick(item.hash)"
                        >
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ senderOrInitiator(item) }}
                                    <v-icon color="blue darken-2">
                                        mdi-arrow-right
                                    </v-icon>
                                    {{
                                        item.target.alias || item.target.address
                                    }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    Secondary line text Lorem ipsum dolor sit
                                    amet,
                                </v-list-item-subtitle>
                                <v-list-item-subtitle>
                                    Transfers:
                                    {{
                                        item.hasOwnProperty("transfers")
                                            ? item.transfers.length
                                            : "0"
                                    }}
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
/* TODO:
  
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
            homelessTransfersCount: 0,
            homelessTransfers: [],
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
            this.loading = true;
            let rawItems = [...this.items];

            Service.getTransactions(
                this.textField,
                this.itemsPerPage,
                this.page
            )
                .then((transactionsRes) => {
                    if (method === "PUT") rawItems = transactionsRes.data;
                    if (method === "PATCH")
                        rawItems = [...this.items, ...transactionsRes.data];

                    const { startId, endId } = this.getItemsInterval(rawItems);

                    Service.getTransfers(this.textField, startId, endId).then(
                        (transferRes) => {
                            this.merging(transferRes.data, rawItems);
                            this.loading = false;
                        }
                    );
                })
                .catch((error) => {
                    console.log("Something wrong", error);
                    this.loading = false;
                });
        },

        checkWallet() {
            this.getTransactions("PUT");
        },

        scrolling(event) {
            const element = event.currentTarget || event.target;
            if (
                element &&
                element.scrollHeight - element.scrollTop ===
                    element.clientHeight
            ) {
                let pageCount = Math.floor(
                    this.items.length / this.itemsPerPage
                );
                this.page = pageCount;

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

            let currentSender = initiator
                ? initiator.alias || initiator.address
                : sender.alias || sender.address;
            return currentSender;
        },

        merging(transferData, rawItems) {
            let idsCollection = new Map();
            const { startIndex, endIndex } = this.getItemsInterval(rawItems);

            for (let i = startIndex; i <= endIndex; i++) {
                rawItems[i].transfers = [];
                idsCollection.set(rawItems[i].id, i);
            }

            transferData.forEach((el) => {
                const indexInItems = idsCollection.get(el.transactionId);

                if (indexInItems === undefined) {
                    this.homelessTransfers.push(el);
                    console.log(
                        "%c HOMELESS_TRANSACTION",
                        "color: red",
                        el.transactionId
                    );
                } else {
                    rawItems[indexInItems].transfers.push(el);
                }
            });
            this.items = rawItems;
            this.checkHomelessTransfers();
        },

        getItemsInterval(items) {
            let startIndex,
                startId,
                endIndex,
                endId = null;

            startIndex =
                this.page * this.itemsPerPage + this.homelessTransfersCount;
            startId = items[startIndex].id;
            endIndex = startIndex + this.itemsPerPage - 1;
            endId = items[endIndex].id;

            return { startIndex, startId, endIndex, endId };
        },

        checkHomelessTransfers() {
            if (this.homelessTransfers.length) {
                this.homelessTransfers.forEach((transfer) => {
                    if (
                        transfer.transactionId <
                        this.items[this.items.length - 1].id
                    ) {
                        this.emergencyPushTransaction(transfer);
                    }
                });
            }
        },

        emergencyPushTransaction(homelessTransfer) {
            let transactionForPush = {};
            let neededId = homelessTransfer.transactionId;

            Service.getTransactionById(neededId).then((transaction) => {
                transactionForPush = { ...transaction.data[0] };
                transactionForPush.transfers = [];
                transactionForPush.transfers.push(homelessTransfer);

                if (Object.keys(transactionForPush).length) {
                    for (let i = this.items.length - 1; i >= 0; i--) {
                        if (
                            this.items[i].id > neededId &&
                            this.items[i - 1].id < neededId
                        ) {
                            this.items.splice(i, 0, transactionForPush);
                            console.log(
                                "%c ITEMS_AFTER_SPLICE",
                                "color: green",
                                this.items
                            );
                            return;
                        }
                    }
                } else {
                    console.log("emergencyPushTransaction: something wrong");
                }
            });

            console.log("Items", this.items);
            this.homelessTransfersCount++;
            this.homelessTransfers = this.homelessTransfers.filter((el) => {
                return el.transactionId !== neededId;
            });
        },
    },
    computed: {
        ripple() {
            return {
                color: "primary--text",
            };
        },
    },
};
</script>

<style>
.container {
    margin-top: 50px;
}
.row-pointer {
    cursor: pointer;
}
</style>