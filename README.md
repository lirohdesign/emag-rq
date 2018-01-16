# emag_rq
bones of a scavenger hunt game


Here are the basics of what this app does:

1. app.js uses data stored in data.json to create qr codes or fill in variables in the template.pug
2. the qr codes are created based on the text that comes after the callback '/code:'
    - for example https://emag-rq.herokuapp.com/code:monkey will create a qr containing the text 'monkey'
3. to print all the codes available in the game database: https://emag-rq.herokuapp.com/print
4. to view an example of a clue during the scavenger hunt game check our: https://emag-rq.herokuapp.com/1
