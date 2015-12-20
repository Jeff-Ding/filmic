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

//  me: object
//    key: movies, songs, books
//    value: array of liked page ID's for that medium
//  friends: object
//    key: friend ID
//    value: "me" object for that friend
//  enhanced: boolean
//  threshold: percentile cutoff for closeness
//    represented as int between 0 and 1
//  return: array of [friend ID, closeness] pairs that exceed threshold
var getNeighbors = function(me, friends, enhanced, threshold) {
  var neighbors = [];
  var length = 0;
  
  for (var id in friends.keys()) {
    var friend = friends.id;
    var closeness = sharedLikes(me, friend, movies);
    
    if (enhanced) {
      closeness += sharedLikes(me, friend, songs);
      closeness += sharedLikes(me, friend, books);
    }
    
    neighbors.push([id, closeness]);
    length++;
  }
  
  neighbors.sort(function(a, b) {
    return a[1] - b[1];
  });
  var cutoff = Math.ceil(length*threshold);
  
  return neighbors.slice(cutoff, length+1);
};


// returns common likes between user and friend
// for specific medium (movies, songs, or books)
var sharedLikes = function(me, friend, medium) {
  var shared = 0;
  for (var myTitle in me.medium) {
    for (var friendTitle in friend.medium) {
      if (myTitle === friendTitle) {
        shared++;
      }
    }
  }
  return shared;
};
