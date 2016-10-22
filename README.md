# emag_rq
bones of a scavenger hunt game


Here are the basics of what this app does:

1. app.js reads from data.json and sends an object back when a key is requested
    this looks like http://localhost/8081/key
2. generate_qrcode.js converts keys and creates a unique QR code
    the code contains text that looks like http://localhost/8081/key
3. index.html runs the timer and general plot of the game
4. pages/print.html is a page that allows for easy printing of all the qr codes
