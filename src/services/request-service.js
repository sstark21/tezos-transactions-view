import axios from 'axios'

export default {
    getTransactions(wallet, limit, page) {
        return axios.get(`https://staging.api.tzkt.io/v1/operations/transactions?anyof.initiator.sender.target=${wallet}&offset.pg=${page}`, {
            params: {
                limit: limit,
            }
        })
    },
    getTransfers(wallet, startId, endId) { 
        return axios.get(`https://staging.api.tzkt.io/v1/tokens/transfers?anyof.from.to=${wallet}&transactionId.ge=${startId}&transactionId.le=${endId}`)
    }
}