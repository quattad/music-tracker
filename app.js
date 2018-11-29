var client_id = '930da2356b374ffca2da7903affee68f';  // insert unique user token here
var client_secret = '';  //  possibly like a 'password'. maybe need to get info from Spotify Developer account. DO NOT PUSH THIS TO GIT.
var redirect_uri = 'localhost:8888';  // figure out what this is, not sure yet

var scopes = /'user-read-private user-read-email'/  // specify what the app should request for. in this case full name, profile image and email address.

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