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
 
    todoList.remaining = function() {
      var count = 0;
      angular.forEach(todoList.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    todoList.archive = function() {
      var oldTodos = todoList.todos;
      todoList.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) todoList.todos.push(todo);
      });
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

        /* This is also the point where you should create a session for the current user. For this purpose you can use the data inside the res.authResponse object. */
      } else {
        /* The user is not logged to the app, or into Facebook: destroy the session on the server. */
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