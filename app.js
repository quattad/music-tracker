// Load Express web server framework module
var express = require('express');

// Load request module
var request = require('request');

/* Load Cross Origin Resource Sharing (CORS) module. 
Further info: https://flaviocopes.com/cors/ */
var cors = require('cors');

/* Load querystring module. Allows parsing and stringifying of URL query strings.
Further info: https://www.npmjs.com/package/query-string */
var querystring = require('querystring');

/* Load cookieParser module. Parses cookie header and handles cookie separation and encoding. Decrypts signed cookies if you know the secret.
Further info: https://www.npmjs.com/package/cookie-parser */
var cookieParser = require('cookie-parser');

 // insert unique user token
var client_id = '930da2356b374ffca2da7903affee68f';

//  possibly like a 'password'. maybe need to get info from Spotify Developer account. DO NOT PUSH THIS TO GIT.
var client_secret = '';

// set redirect address after user authentication
var redirect_uri = 'http://localhost:8888/callback';

// specify what the app should request for. in this case full name, profile image and email address.
var scope = /'user-read-private user-read-email'/;

/* 
There should be a total of three calls to the Spotify Accounts Service.
CALL 1: to /authorize endpoint. 
- to authenticate user and get user's authorization to access data
- passes client ID, scopes and redirect URI.
- receives authorization code

CALL 2: to Spotify Accounts Service /api/token endpoint
- passes authorization code from first call and client secret key
- receives access token and refresh token

CALL 3: to manage requests to /refresh_token
- generate new access token to issue if previous token has expired
*/ 

/*
Takes in specified length and generate random string containing allowed characters. 
Not sure of function purpose at this point in time.
*/
var generateRandomString = function(length) {
    var text = '';

    // specify possible characters in the text
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    /*
    Generate a random character from string of possible characters every loop, for number of iterations equal to possible characters.
    charAt() method: returns first character of the string
     */
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

// Possibly to fetch current status of user authentication. Should research.
var stateKey = 'spotify_auth_state';

/* store app object returned by express function
express() function is a top level function exported by express NodeJS module.
*/
var app = express()

/* setup local server to listen for requests 
delete before deploying */
var server = app.listen(8888, () => {
    console.log("listening on 8888...")
});

// create middleware function that will load files from within a given root directory. 
app.use(express.static(__dirname + "/public"))

// execute cors middleware
app.use(cors());

// execute cookieParser middleware
app.use(cookieParser());


/* Create routing method that calls a specified anonymous callback function that activates when application receives request to
/login endpoint.
Callback function redirects user to Spotify for authentication.
Passes in client id, scope, redirect url and saves current state as a unique string. */
app.get('/login', function(req, res) {
    /* generateRandomString is used here! generate a unique string for state */
    var state = generateRandomString(16);

    /* stores in response a cookie with value of stateKey = 'spotify_auth_state' and generated unique string for state as above */
    res.cookie(stateKey, state);

    /* redirect to authentication page on Spotify Accounts Service.
    This is CALL 1. */

    res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type : 'code',
        client_id : client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state:state
    }));
});