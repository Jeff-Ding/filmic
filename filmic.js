// Filmic - Films From Friends
// Sahil Gupta and Jeff Ding
// CS 458 = Automated Decision Systems


/* begin: code for html and view */

var app = angular.module('filmicApp', ['ngMaterial']);

app.controller('filmicController', function($scope, $rootScope, $http) {
  $scope.enhanced = true; // whether to read movies/books/songs or only movies
  $scope.hipster = false; // whether to favor less popular movies
  $scope.weights = {      // default weights for decision factors
    popularity: 60,         // weight for facebook likes
    reviews: 40,            // weight for rotten tomatoes score
    trustworthiness: 80,    // weight for friends with more in common
    filmbuff: 20            // weight for friends who have seen many films
  }

  $scope.people = {};       // json of person and all friends
  $scope.globalLikes = {};  // json of facebook likes
  $scope.tomatometer = {};  // json of rotten tomatoes score

  // get data from json files
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
      $scope.greeting = 'hello ' + $scope.people.person1.name;
  }


  // list favorite movies, songs, and books
  $scope.listInfo = function() {
    $scope.movieList = JSON.stringify($scope.people.person1.movies, null, 4);
    $scope.songList = JSON.stringify($scope.people.person1.songs, null, 4);
    $scope.bookList = JSON.stringify($scope.people.person1.books, null, 4);
  };

  // list neighbors in the 70% percentile of things in common
  // display their name and N things in common
  $scope.getNeighbors = function() {
    var threshold = .7

    $scope.neighbors = getNeighbors($scope.people.person1, $scope.people.friends, $scope.enhanced, threshold);
    
    // map from id to name
    var neighborCopy = angular.copy($scope.neighbors);
    for (var i in neighborCopy) {
      neighborID = neighborCopy[i][0];
      neighborCopy[i][0] = $scope.people.friends[neighborID].name;
    }

    $scope.neighborList = JSON.stringify(neighborCopy, null, 4);
  };


  // get film recommendations from neighbors
  $scope.getRecs = function() {
    var weights = [$scope.weights.popularity, $scope.weights.reviews, $scope.weights.trustworthiness, $scope.weights.filmbuff]

    var result = getRecs($scope.neighbors, $scope.people.friends, $scope.hipster, weights, $scope.globalLikes, $scope.tomatometer);
    
    $scope.recs = JSON.stringify(result, null, 4);
  };

});

/* end: code for html and view */



/* begin: code for recommendern algorithm */

//  me: object
//    key: movies, songs, books
//    value: array of liked page ID's for that medium
//  friends: object
//    key: friend ID
//    value: "me" object for that friend
//  enhanced: boolean of whether to looks at songs and books too
//  threshold: percentile cutoff for closeness
//    represented as float between 0 and 1
//  return: array of [friend ID, closeness] pairs that exceed threshold
var getNeighbors = function(me, friends, enhanced, threshold) {
  var neighbors = [];
  var length = 0;
  var ids = Object.keys(friends);

  // look through all friends
  for (var i in ids) {
    var friend = friends[ids[i]];
    var closeness = sharedLikes(me, friend, 'movies');

    if (enhanced) {
      closeness += sharedLikes(me, friend, 'songs');
      closeness += sharedLikes(me, friend, 'books');
    }

    neighbors.push([ids[i], closeness]);
    length++;
  }

  // sort descending
  neighbors.sort(function(a, b) {
    return b[1] - a[1];
  });

  var cutoff = length - Math.floor(length * threshold);
  return neighbors.slice(0, cutoff);
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


//  hipster: boolean of whether to prefer movies less popular at the box office
//  weights: length 4 array of weights
//    indices:
//      0: popularity       // weight for facebook likes
//      1: reviews          // weight for rotten tomatoes score
//      2: trustworthiness  // weight for friends with more in common
//      3: filmBuffFactor   // weight for friends who have sen many films
//  globalLikes         // json of facebook likes
//  tomatometer         // json of rotten tomatoes score
var getRecs = function(me, neighbors, friends, hipster, weights, globalLikes, tomatometer) {
  var recs = [];

  // get all movies liked by neighbors
  for (var i in neighbors)
    recs = recs.concat(friends[neighbors[i][0]].movies);

  recs = removeDuplicates(recs);
  
  // only include movies user hasn't already liked
  recs = recs.filter(function(x) {
    if (me.movies.indexOf(x) === -1) {
      return x;
    }
  });

  // calculate score of each movie
  for (i in recs) {
    var movie = recs[i];
    var popularity = Math.ceil(Math.log(globalLikes[movie]));
    var reviews = tomatometer[movie];
    var trustworthiness = 0;
    var filmBuffFactor = 0;

    // only evaluate neighbors who have liked the movie
    for (var j in neighbors) {
      var neighbor = neighbors[j][0];
      if (friends[neighbor].movies.indexOf(movie) > -1) {
        var closeness = neighbors[j][1];

        trustworthiness += closeness;
        filmBuffFactor += friends[neighbor].movies.length;
      }
    }

    // invert the importance of mass popularity
    if (hipster)
      popularity *= -1;

    popularity *= weights[0];
    reviews *= weights[1];
    trustworthiness *= weights[2];
    filmBuffFactor *= weights[3];
    
    recs[i] = [movie, popularity, reviews, trustworthiness, filmBuffFactor];
  }

  // sort by sum of scores, descending
  recs.sort(function(a, b) {
    var aSum = a.slice(1, 5).reduce(sum);
    var bSum = b.slice(1, 5).reduce(sum);

    return bSum - aSum;
  });
 
  // save top 10
  recs = recs.slice(0, 10);

  // console.log(angular.copy(recs)); // for debugging

  // condense scores in a string
  // store sum of 4 scores at end of array
  for (i in recs) {
    var stringscores = recs[i].slice(1,5).join(', ');
    var netscore = 'net score = ' + recs[i].slice(1,5).reduce(sum);
    recs[i] = [recs[i][0], stringscores, netscore]
  }

  return recs;
};


var sum = function(x, y) {
  return x + y;
};


var removeDuplicates = function(x) {
  return x.sort().filter(function(item, pos, ary) {
    return !pos || item != ary[pos - 1];
  });
};

/* end: code for recommender algorithm */
