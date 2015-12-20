var app = angular.module('filmicApp', []);

app.controller('FilmicController', function($scope, $rootScope) {

  $scope.sayHello = function() {
    $scope.greeting = 'hello ' + $rootScope.user.name;
  };

});


// runs at the beginning
app.run(function($rootScope, $window) {

  $rootScope.user = {};
  
  // execute when the sdk is loaded
  $window.fbAsyncInit = function() {
    FB.init({
      appId: '498650293637737',
      status: true,
      cookie: true,
      xfbml: true
    });

    // watch login change
    FB.Event.subscribe('auth.authResponseChange', function(result) {
      if (result.status === 'connected') {
        FB.api('/me', function(result) {
          $rootScope.$apply(function() { 
            $rootScope.user = result;   // user is stored in $rootScope.user
          });
        });
      } else {
        console.log("the user isn't logged in");
      }
    });
  };

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