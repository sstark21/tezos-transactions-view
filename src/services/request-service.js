import axios from 'axios'

export default {
    getTransactions(wallet, limit, page) {
        return axios.get(`https://staging.api.tzkt.io/v1/operations/transactions`, {
            params: {
                "anyof.initiator.sender.target": wallet,
                limit: limit,
                "offset.pg": page
            }
        })
    },
    getTransactionById(id) {
         return axios.get(`https://staging.api.tzkt.io/v1/operations/transactions`, {
            params: {
                id: id
            }
        })
     },
    getTransfers(wallet, startId, endId) { 
        return axios.get(`https://staging.api.tzkt.io/v1/tokens/transfers?`, {
            params: {
                "anyof.from.to": wallet,
                "transactionId.ge": startId,
                "transactionId.le": endId
            }
        })
    }
}