(function () {
    function getHashParams() {
            var hashParams = {};
            var e, r = /([^&;=]+)=?([^&;]*)/g,
                q = window.location.hash.substring(1);
            while ( e = r.exec(q)) {
                hashParams[e[1]] = decodeURIComponent(e[2]);
            }
            
            return hashParams;
        };
    
        // Return innerHTML of user-profile-template element as an object to store in userProfileSource.
        // Possibly will be used to modify something in the element later
        var userProfileSource = document.getElementById('user-profile-template').innerHTML;
    
        /* 
        Handlebars.compile compiles a template so it can be executed immediately.
        Further info: https://handlebarsjs.com/reference.html
        */
        var userProfileTemplate = Handlebars.compile(userProfileSource);
    
        var userProfilePlaceholder = document.getElementById("user-profile");
    
        // see userProfileSource comments
        var oauthSource = document.getElementById("oauth-template").innerHTML;
    
        // see userProfileTemplate comments
        // Handlebars.compile returns a function? see call in else statement below
        var oauthTemplate = Handlebars.compile(oauthSource);
    
        var oauthPlaceholder = document.getElementById("oauth");
    
        // obtain necessary parameters from URL. should be defined in the IIFE above
        var params = getHashParams();
    
        // not sure why access_token needs to be obtained from the URL?
        // why cannot be obtained from the /callback routing method in app.js?
        var access_token = params.access_token;
    
        // see access_token
        var refresh_token = params.refresh_token;
    
        var error = params.error;
    
        if (error) {
            alert('Error during authentication!');
        } 
        else {
            if (access_token) {
                // render oauth info if access_token is present
                // what this is doing is probably replacing the placeholders in 
                oauthPlaceholder.innerHTML = oauthTemplate({
                    access_token: access_token,
                    refresh_token: refresh_token
                });
    
                $.ajax({
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    success: function(response) {
                        // TO DEL
                        console.log("AJAX call to api.spotify.com/v1/me successful!")
                        userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                        $('#login').hide();
                        $('#loggedin').show();
                    }  // close success function
                }); // close AJAX
            }  // close access_token if statement 
            
            else {
                // load initial screen before login
                $('#login').show();
                $('#loggedin').hide();
            }  // close else for access_token if statement

            document.getElementById('obtain-new-token').addEventListener('click', function() {

                // TO DEL

                console.log("obtain-new-token event listener activated!")
                $.ajax({
                    url:'/refresh_token',
                    data: {
                        'refresh_token':refresh_token
                    }
                }).done(function(data){
                    access_token = data.access_token;
                    oauthPlaceholder.innerHTML = oauthTemplate({
                        access_token:access_token,
                        refresh_token: refresh_token
                    }); // close oauthTemplate call
                });  // close .done method call
            }, false);  // close addEventListener call. find out what false is for.
        }  // close else for authentication check if statement
    }
)();  // close IIFE
