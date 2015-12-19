var app = angular.module('filmicApp', [])
  .controller('FilmicListController', function() {
    var todoList = this;
    todoList.todos = [
      {text:'learn angular', done:true},
      {text:'build an angular app', done:false}];
 
    todoList.addTodo = function() {
      todoList.todos.push({text:todoList.todoText, done:false});
      todoList.todoText = '';
    };
 
  });



app.run(['$rootScope', '$window',  function($rootScope, $window) {

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
    FB.Event.subscribe('auth.authResponseChange', function(res) {
      if (res.status === 'connected') {

        FB.api('/me', function(res) {
          $rootScope.$apply(function() { 
            $rootScope.user = res; // important line
          });
        });
          
        // the user object exists in "$rootScope.user"
        console.log($rootScope.user);
        console.log(res.authResponse);
        
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

}]);