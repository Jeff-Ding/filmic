var app = angular.module('filmicApp', ['ngMaterial']);

app.controller('filmicController', function($scope, $rootScope, $http) {
  $scope.enhanced = true;
  $scope.hipster = false;

  $scope.people = {};
  $scope.globalLikes = {};
  $scope.tomatometer = {};

  $http.get('./people.json').success(function(data) {
    $scope.people = data;
  });
  $http.get('./globalLikes.json').success(function(data) {
    $scope.globalLikes = data;
  });
  $http.get('./tomatometer.json').success(function(data) {
    $scope.tomatometer = data;
  });

 
  $scope.sayHello = function() {
      // $scope.greeting = 'hello'
      $scope.greeting = 'hello ' + $scope.people.person1.name;
  }


  $scope.listInfo = function() {
    $scope.movieList = JSON.stringify($scope.people.person1.movies, null, 4);
    $scope.songList = JSON.stringify($scope.people.person1.songs, null, 4);
    $scope.bookList = JSON.stringify($scope.people.person1.books, null, 4);
  };

  $scope.getNeighbors = function() {
    $scope.neighbors = getNeighbors($scope.people.person1, $scope.people.friends, $scope.enhanced, .8);
    
    // map from neighbor's id to neighbor's name
    var neighborCopy = angular.copy($scope.neighbors);
    for (var i in neighborCopy) {
      neighborID = neighborCopy[i][0];
      neighborCopy[i][0] = $scope.people.friends[neighborID].name;
    }
    $scope.neighborList = JSON.stringify(neighborCopy, null, 4);
  };

  $scope.getRecs = function() {
    var result = getRecs($scope.neighbors, $scope.people.friends, $scope.hipster, [1,2,3,4], $scope.globalLikes, $scope.tomatometer);
    $scope.recs = JSON.stringify(result, null, 4);
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
  var ids = Object.keys(friends);

  for (var i in ids) {
    var friend = friends[ids[i]];
    var closeness = sharedLikes(me, friend, "movies");

    if (enhanced) {
      closeness += sharedLikes(me, friend, "songs");
      closeness += sharedLikes(me, friend, "books");
    }

    neighbors.push([ids[i], closeness]);
    length++;
  }

  neighbors.sort(function(a, b) {
    return a[1] - b[1];
  });

  var cutoff = Math.ceil(length*threshold);
  return neighbors.slice(cutoff, length);
};


// returns common likes between user and friend
// for specific medium (movies, songs, or books)
var sharedLikes = function(me, friend, medium) {
  var shared = 0;
  var myTitles = me[medium];
  var friendTitles = friend[medium];

  for (var i in myTitles) {
    for (var j in friendTitles) {
      if (myTitles[i] === friendTitles[j])
        shared++;
    }
  }

  return shared;
};


//  hipster: boolean
//  weights: length 4 array of weights
//    indicies:
//      0: popularity
//      1: reviews
//      2: trustworthiness
//      3: filmBuffFactor
//  globalLikes: hashtable
//  tomatometer: hashtable
var getRecs = function(neighbors, friends, hipster, weights, globalLikes, tomatometer) {
  var recs = [];

  // get all movies liked by neighbors
  for (var i in neighbors)
    recs = recs.concat(friends[neighbors[i][0]].movies);

  recs = removeDuplicates(recs);

  // get scores
  for (i in recs) {
    var movie = recs[i];
    var popularity = Math.log(globalLikes[movie]);
    var reviews = tomatometer[movie];
    var trustworthiness = 0;
    var filmBuffFactor = 0;

    for (var j in neighbors) {
      var neighbor = neighbors[j][0];
      if (friends[neighbor].movies.indexOf(movie) > -1) {
        var closeness = neighbors[j][1];

        trustworthiness += closeness;
        filmBuffFactor += friends[neighbor].movies.length;
      }
    }

    if (hipster)
      weights[0] *= -1;

    popularity *= weights[0];
    reviews *= weights[1];
    trustworthiness *= weights[2];
    filmBuffFactor *= weights[3];
    
    recs[i] = [movie, popularity, reviews, trustworthiness, filmBuffFactor];
  }

  // sort by sum of scores, descending
  recs.sort(function(a, b) {
    var sum = function(x, y) {
      return x + y;
    };

    var aSum = a.slice(1,5).reduce(sum);
    var bSum = b.slice(1,5).reduce(sum);

    return bSum - aSum;
  });
  
  // top 10
  recs = recs.slice(0,10);

  // only want movie ids
  for (i in recs)
    recs[i] = recs[i][0];

  return recs;
};

var removeDuplicates = function(x) {
  return x.sort().filter(function(item, pos, ary) {
    return !pos || item != ary[pos - 1];
  });
};
