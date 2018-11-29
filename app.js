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
var redirect_uri = 'localhost:8888';

// specify what the app should request for. in this case full name, profile image and email address.
var scopes = /'user-read-private user-read-email'/;

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