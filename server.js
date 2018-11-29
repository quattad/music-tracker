/* Notify user that local server is initializing */
console.log("Server is starting!")

/* Import express package */
var express = require('express')

/* */
var app = express();

/* run server */
var server = app.listen(8888, () => {
    console.log("listening on 8888...")
});

app.use(express.static('public'));