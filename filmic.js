var app = angular.module('filmicApp', []);

app.controller('filmicController', function($scope, $rootScope) {

  $scope.sayHello = function() {
    $scope.greeting = 'hello ' + $rootScope.user.name;
  };




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
