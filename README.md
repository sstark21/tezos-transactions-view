# [Tezos Transactions Viewer](https://sstark21.github.io/tezos-transactions-view/)

## Техническое задание: 
### Часть 1 - UX
Нужно сделать мини-приложение для просмотра транзакций аккаунта. Т.е. вводишь адрес аккаунта (например **tz1Yz97pBfZmVvpPy9AAXHSocWM7Vb7XKRm3**) и смотришь его транзакции.
Транзакции нужно получать [тут](https://staging.api.tzkt.io/#operation/Operations_GetTransactions)([пример](https://staging.api.tzkt.io/v1/operations/transactions?anyof.initiator.sender.target=tz1Yz97pBfZmVvpPy9AAXHSocWM7Vb7XKRm3)). Каждый элемент списка (транзакция) должен по клику вести на tzkt.io/{transactionHash}. Что и как отображать - надо придумать самому. Основная цель - сделать удобный и приятный списочек с хорошим UXом.

### Часть 2 - логика
Нужно усовершенствовать список транзакций из первой части путем замешивания в него "token transfers". Немного теории: транзакция в Тезосе - это базовая операция, которую пользователь может совершить/отправить в блокчейн, содержащая какие-то параметры внутри себя. В результате исполнения транзакций могут происходить разные вещи, например, простой перевод средств, вызов смарт контракта, переводы токенов, и т.п. Т.е. токен трансферы по сути являются результатом исполнения каких-то транзакций, и иерархически являются их дочерними элементами.
Например, имея транзакцию
```js
{
  "type": "transaction",
  "id": 49244666,
  "sender": ...,
  "target": ...
}
```
и токен трансфер
```js
{
  "token": ...,
  "from": ...,
  "to": ...,
  "amount": ...,
  "transactionId": 49244666
}
```
Мы можем смерджить их в один объект по transaction.id и transfer.transactionId:
```js
{
  "type": "transaction",
  "id": 49244666,
  "sender": ...,
  "target": ...
  "transfers": [
    {
      "token": ...,
      "from": ...,
      "to": ...,
      "amount": ...,
      "transactionId": 49244666
    }
  ]
}
```
Именно это и нужно сделать. Нужно использовать [эту апи](https://staging.api.tzkt.io/#operation/Tokens_GetTokenTransfers) ([пример](https://staging.api.tzkt.io/v1/tokens/transfers?anyof.from.to=tz1Yz97pBfZmVvpPy9AAXHSocWM7Vb7XKRm3)), чтобы получить список токен трансферов нашего аккаунта, и вмерджить его в список транзакций (у каждой транзакции, у которой есть трансфер(ы), должно появиться поле "transfers": [...]). После этого, в отображаемый список нужно добавить инфу о том, что в транзакции есть токен трансфер(ы) (если они есть).

### Часть 3 (если хватит сил)
Возможна ситуация, при которой токен трансфер будет ссылаться на транзакцию, которой нет в списке. Например, токены перевели нам, но транзакция была сделана не нами, следовательно, в нашей выдаче ее просто нет, и вмердживать ее некуда. В данном случае, отсутствующие транзакции надо дозагружать, используя [эту апи](https://staging.api.tzkt.io/#operation/Operations_GetTransactions) и в них уже вмердживать токен трансферы.

P.S. и транзакции и трансферы надо загружать порциями (пагинировать, используя курсор типа "id"). Нельзя загружать сразу все, т.к. есть аккаунты, у которых миллионы операций и токен трансферов.

## Запуск проекта

### Предустановить все необходимое 
```js
npm i
```

### Запуск проекта
```js
npm run serve
```

### Деплой проекта на GitHubPages
Подробно про деплой на GitHub Pages можно почитать [тут](https://medium.com/swlh/deploy-vue-app-to-github-pages-2ada48d7397e)
```js
npm run deploy
```

### Сборка проекта 
```js
npm run build
```
