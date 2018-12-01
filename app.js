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
var client_secret = '233b53bb038342c7b9031ebc2ffe4319';

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

    // TO DEL
    console.log('Successfully loaded /login');

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

/* Create routing method with endpoint /callback. Request refresh and access tokens after checking state perimeter.
This is CALL 2.
*/ 
app.get('/callback', function(req, res) {

    // TO DEL
    console.log('Successfully loaded /callback');

    /* req.query is an object containing a property for each query string parameter in the browser.
    e.g. GET /search?q=tobi+ferret; req.query.q => "tobi ferret"
    e.g. GET /shoes?order=desc; req.query.order => "desc"
    */

    // extract query string parameter 'code' from url
    var code = req.query.code || null;
    
    // extract query string parameter 'state' from url
    var state = req.query.state || null;
    
    /* req.cookies is a property that contains cookies sent by request.
    if request object contains no cookies, it defaults to {} */ 
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    /* 
    check if unsuccessful query was returned or if state is different from the currently stored state.
    should come back to dissect, currently not so clear 
    */ 
    if (state === null || state !== storedState) {
        res.redirect('/#' + querystring.stringify(
            {error:'state_mismatch'}
        ))
    }
    
    else {
        // TO DEL
        console.log('No state_mismatch. State != NULL and State === storedState');
        
        /*res.clearCookie method clears cookie from respones object specified by stateKey
        stateKey is therefore to generate a unique name for the cookie in each session (?) */
        res.clearCookie(stateKey);

        /* authOptions is a JSON object that contains required parameters grant_type, code and redirect_uri.
        Will be passed in POST request to '/api/token' endpoint.
       
        REQUEST BODY PARAMETERS
        grant_type - must contain value 'authorization_code' as specified in OAuth 2.0 specification
        code - authorization code returned from initial request to /authorize endpoint .see '/login' routing method
        redirect_uri - no actual redirection takes place. value of parameter is only used for validation 
        
        HEADER PARAMETERS
        authorization - base 64 encoded string with client ID and client secret key with specified format.
        Further info: https://developer.spotify.com/documentation/general/guides/authorization-guide/
        */
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code:code,
                redirect_uri:redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json:true
        };

      // POST request to Spotify Accounts service to submit authOptions and
      // receive access_token and refresh_token 
      request.post(authOptions, function(error, response, body){
        
        // TO DEL
        console.log('Execute POST request to /api/token...');

        if (!error && response.statusCode === 200) {

            // TO DEL
            console.log('No error and response is OK');

            var access_token = body.access_token
            var refresh_token = body.refresh_token
            
            console.log('access_token is ' + access_token);
            console.log('refresh_token is ' + refresh_token);

            var options = {
                url:'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization':'Bearer' + access_token},
                json: true
                };

            // use access token to access Spotify Web API
            request.get(options, function(error, response, body){
                // prints content of body to the console.
                // why?
                console.log(body);
            });
            
            /* 
            alternatively pass token to browser to make requests accordingly
            querystring.stringify serializes object into URL query string
            general form: querystring.stringify(obj[, sep[, eq[, options]]])
            obj - object to be serialized
            sep - substring to delimit key value pairs in query string. default: &
            eq - substring used to delimit keys and values in query string. default: =
            options - encodeURIComponent <function> where
            <function> is used when converting URL-unsafe characters to % encoding.
            <function> default: querystring.escape()
            */
            res.redirect('/#' + querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
            }));
            } else {
                console.log('Error generated or statusCode not 200!')
                res.redirect('/#' + 
                querystring.stringify({
                    error: 'invalid_token'
                })
                );
            }
        }
    )
    };
});


// executed after access token has expired
app.get('/refresh_token', function(req, res) {

    // request access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions ={
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        form:{
            grant_type: 'authorization_code',
            
            //refresh token here was obtained from authorization code exchange conducted when application requested access_token and refresh_token
            refresh_token: refresh_token
        },
        json: true
    };

    // execute POST method to URL specified in authOptions. part of callback for /refresh_token
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });  // close res.send
        }  // close if
    });  // close request.post
});  // close app.get