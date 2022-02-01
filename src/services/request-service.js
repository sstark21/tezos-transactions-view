import axios from 'axios'

export default {
    getWalletTransactions(wallet) {
        return axios.get(`https://staging.api.tzkt.io/v1/operations/transactions?anyof.initiator.sender.target=${wallet}`, {
            params: {
                limit: 5
            }
        })
    }
}