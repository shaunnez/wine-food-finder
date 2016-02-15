// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'firebase', 'angularMoment', 'starter.controllers', 'starter.services'])

.constant('$ionicLoadingConfig', {
	template: '<ion-spinner icon="ripple" class="custom-loader"></ion-spinner>'
})
.run(function($ionicPlatform, $rootScope, $state, $ionicLoading) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
	$ionicLoading.show();
  });
  
  $rootScope.loaded = false;
  
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
	  if(!$rootScope.loaded) {
		  $rootScope.loaded = true;
		  event.preventDefault();
		  $state.go('home', null, true);
	  }
  });
  
  
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

	$ionicConfigProvider.tabs.position('bottom');
	$ionicConfigProvider.navBar.alignTitle('center');
	$ionicConfigProvider.backButton.text('Back');
	
	$stateProvider
	.state('home', {
		url:'/home',
		controller: 'HomeCtrl',
		templateUrl: 'templates/home.html'
	})
	.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'templates/tabs.html'
	})
	.state('tab.food', {
		url: '/food',
		views: {
			'tab-food': {
				templateUrl: 'templates/tab-food.html',
				controller: 'FoodCtrl'
			}
		}
	})
	.state('tab.wine', {
		url: '/wine',
		views: {
			'tab-wine': {
				templateUrl: 'templates/tab-wine.html',
				controller: 'WineCtrl'
			}
		}
	})
	.state('tab.wine-detail', {
		url: '/wine/:name',
		views: {
		  'tab-wine': {
		    templateUrl: 'templates/wine-detail.html',
		    controller: 'WineDetailCtrl'
		  }
		}
	})
	.state('tab.recipe', {
		url: '/recipe',
		views: {
			'tab-recipe': {
				templateUrl: 'templates/tab-recipe.html',
				controller: 'RecipeCtrl'
			}
		}
	})
	.state('tab.recipe-detail', {
		url: '/recipe/:name',
		views: {
		  'tab-recipe': {
		    templateUrl: 'templates/recipe-detail.html',
		    controller: 'RecipeDetailCtrl'
		  }
		}
	})

	.state('tab.rooms', {
		url: '/rooms',
		views: {
			'tab-rooms': {
				templateUrl: 'templates/tab-rooms.html',
				controller: 'RoomsCtrl'
			}
		}
	})
	.state('tab.rooms-chat', {
		url: '/rooms/:roomId',
		views: {
			'tab-rooms': {
				templateUrl: 'templates/tab-rooms-chat.html',
				controller: 'ChatCtrl'
			}
		}
	})
	
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

});
