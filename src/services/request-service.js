import axios from 'axios'

export default {
    getWalletTransactions(wallet, limit, page) {
        return axios.get(`https://staging.api.tzkt.io/v1/operations/transactions?anyof.initiator.sender.target=${wallet}&offset.pg=${page}`, {
            params: {
                limit: limit,
            }
        })
    }
}