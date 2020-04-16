# emag_rq
bones of a scavenger hunt game

the development example of this game is currently deployed on heroku
https://emag-rq.herokuapp.com/


here are the basics of what this app does:

1. https://emag-rq.herokuapp.com/game_builder runs a static html form that saves data to MongoDB
   to create your own scavenger hunt.
2. app.js uses data stored in MongoDB to create qr codes or fill in variables in the template.pug
3. the qr codes are created based on the text that comes after the callback '/code:'
    - for example https://emag-rq.herokuapp.com/code:monkey will create a qr containing the text 'monkey'
4. to print all the codes available in the game database: https://emag-rq.herokuapp.com/print
5. to view an example of a clue during the scavenger hunt game scan one of the codes.
