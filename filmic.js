var app = angular.module('filmicApp', []);

app.controller('FilmicController', function($scope) {
  $scope.test = "testtt"
});


// runs at the beginning
app.run(function($scope, $window) {

  $scope.user = {};
  
  // execute when the sdk is loaded
  $window.fbAsyncInit = function() {
    FB.init({
      appId: '498650293637737',
      status: true,
      cookie: true,
      xfbml: true
    });

    // watch login change
    FB.Event.subscribe('auth.authResponseChange', function(res) {
      if (res.status === 'connected') {
        // get the user, and store in "$scope.user"
        FB.api('/me', function(res) {
          $scope.$apply(function() { 
            $scope.user = res; // important line
          });
        });
      } else {
        console.log("the user isn't logged in");
      }
    });
  };

  // immediately invoked function
  // load the facebook sdk
  (function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "https://connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
  }(document));

});