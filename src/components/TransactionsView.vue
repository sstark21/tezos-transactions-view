<template>
    <v-container>
        <v-snackbar
            :value="snackbar.active"
            top
            right
            color="orange accent-1"
            timeout="3000"
            content-class="deep-orange--text"
            width="500"
        >
            Something went wrong: <strong>{{ snackbar.text }}</strong>
        </v-snackbar>

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
                <v-icon
                    class="row-pointer theme-button"
                    @click="$vuetify.theme.dark = !$vuetify.theme.dark"
                >
                    mdi-theme-light-dark
                </v-icon>
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
                    elevation="5"
                    color="info"
                    @click="checkAddress"
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
                style="position: relative"
            >
                <v-btn
                    v-show="fab"
                    fab
                    absolute
                    bottom
                    right
                    color="primary"
                    class="to-top-button"
                    @click="$vuetify.goTo(0, { container: $refs.card })"
                >
                    <v-icon>mdi-arrow-up</v-icon>
                </v-btn>
                <v-virtual-scroll
                    ref="card"
                    :bench="benched"
                    :items="items"
                    height="500"
                    item-height="100%"
                    @scroll.native="scrolling"
                    class="overflow-x"
                    :class="checkTheme"
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
                                <v-list-item-subtitle
                                    class="d-flex justify-space-between"
                                >
                                    <span>{{ gasComputed(item) }}</span>
                                    <span
                                        >Amount:
                                        <strong>{{ item.amount }}</strong></span
                                    >
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
import Service from "../services/request-service";
import { validateAddress } from "@taquito/utils";

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
            snackbar: {
                active: false,
                text: "",
            },
            lightTheme: true,
            fab: false,
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
                    this.alertMessage(
                        "GET_TRANSACTION_ERROR - contact administrator"
                    );
                    console.log(error);
                    this.loading = false;
                });
        },

        checkAddress() {
            if (validateAddress(this.textField) === 3) {
                this.getTransactions("PUT");
            } else {
                this.alertMessage("unsupported address");
            }
        },

        scrolling(event) {
            const element = event.currentTarget || event.target;

            this.fab = element.scrollTop > 300;

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
                    this.alertMessage(
                        "EMERGENCY_PUSH_TRANSACTION - contact administrator"
                    );
                }
            });

            console.log("ITEMS_BEFORE_SPLICE", this.items);
            this.homelessTransfersCount++;
            this.homelessTransfers = this.homelessTransfers.filter((el) => {
                return el.transactionId !== neededId;
            });
        },
        alertMessage(text) {
            this.snackbar = {
                active: true,
                text,
            };
        },
        gasComputed({ gasUsed, gasLimit }) {
            return `Available gas: ${gasUsed} / ${gasLimit}`;
        },
    },
    computed: {
        ripple() {
            return {
                color: "primary--text",
            };
        },
        checkTheme() {
            return this.$vuetify.theme.dark ? "dark" : "light";
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
.row-pointer:hover {
    transform: scale(1.01);
    transition: all 0.2s ease-in-out;
}
.theme-button {
    margin: 0 20px 20px 0;
}
.overflow-x {
    overflow-x: hidden !important;
}
.v-icon.v-icon::after {
    height: 0% !important;
}
.to-top-button {
    margin: 0 -100px 30px 0;
}

.light::-webkit-scrollbar {
    width: 15px;
}

.light::-webkit-scrollbar-track {
    background: #e6e6e6;
    border-left: 1px solid #dadada;
}

.light::-webkit-scrollbar-thumb {
    background: #b0b0b0;
    border: solid 3px #e6e6e6;
    border-radius: 7px;
}

.light::-webkit-scrollbar-thumb:hover {
    background: black;
}

.dark::-webkit-scrollbar {
    width: 15px;
}

.dark::-webkit-scrollbar-track {
    background: #202020;
    border-left: 1px solid #2c2c2c;
}

.dark::-webkit-scrollbar-thumb {
    background: #3e3e3e;
    border: solid 3px #202020;
    border-radius: 7px;
}

.dark::-webkit-scrollbar-thumb:hover {
    background: white;
}
</style>