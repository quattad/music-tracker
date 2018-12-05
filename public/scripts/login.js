$(document).ready(function () {
    alert('Document has loaded!')
    $("#body").load("/templates/login.html")  // you must specify absolute path i.e. /templates/test-load.html
})