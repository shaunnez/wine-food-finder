angular.module('starter.controllers', ['ionic'])


.controller('HomeCtrl', function($rootScope, $scope, $http, $ionicLoading, $state, $timeout, $cordovaSplashscreen) {
	
	$rootScope.fullData = {
		products: [],
		varieties: [],
		styles: [],
		foodMatches: [],
		regions: [],
		recipes: [],
		selectedVariety: '',
		selectedStyle: '',
		selectedFoodMatch: '',
		selectedRegion:''
	};
	
	$scope.proxyUrl = 'http://query.yahooapis.com/v1/public/yql';
	$scope.baseUrl = 'http://www.newworld.co.nz/handlers/winefinder/';
	//$scope.varietyFilterUrl = 'filter.ashx?option=variety';
	//$scope.styleFilterUrl = 'filter.ashx?option=style';
	//$scope.foodMatchFilterUrl = 'filter.ashx?option=foodMatch';
	//$scope.regionFilterUrl = 'filter.ashx?option=region';
	$scope.wineFinderUrl = 'wine.ashx';
	
	$scope.recipeUrl = 'https://www.kimonolabs.com/api/d45adziw?apikey=7IVKRqcrbHGyU6pEnlWS0y8YLZmMleTj&callback=JSON_CALLBACK';
	$scope.recipeOnDemandUrl = 'https://www.kimonolabs.com/api/ondemand/d45adziw?apikey=7IVKRqcrbHGyU6pEnlWS0y8YLZmMleTj&search='; // append term
	
	$scope.getData = function(url, options, callback) {
		options = options || {};

		$.ajax({
			'url': $scope.proxyUrl,
			'data': {
				'q': 'SELECT * FROM json WHERE url="'+ url +'"',
				'format': 'json',
				'jsonCompat': 'new',
			},
			'dataType': 'jsonp',
			'success': function(response) {
				var output = [];
				if(response && response.query && response.query.results && response.query.results.json) {
					output = response.query.results.json.json;
				}
				callback(output);
			}, 
			'error': function(response) {
				callback([]);
			}
		});
	}
	
	
	$scope.loadAllData = function(useLocal, callback) {
		
		if(useLocal && localStorage.getItem('fullData')) {
			$rootScope.fullData = JSON.parse(localStorage.getItem('fullData'));
			callback();
		} else {
		
			async.parallel({
				products: function(callback) {
					$scope.getData($scope.baseUrl + $scope.wineFinderUrl, {}, function(results) {
						
						_.each(results, function(item) {
							item.searchText = (item.name + ' ' + item.region + ' ' + item.variety + ' ' + item.year + ' ' + item.style + ' ' + ' ' + item.foodMatch.join(' ')).toLowerCase();
						
							if($rootScope.fullData.varieties.indexOf(item.variety) === -1) {
								$rootScope.fullData.varieties.push(item.variety);
							}
						
							if($rootScope.fullData.styles.indexOf(item.style) === -1) {
								$rootScope.fullData.styles.push(item.style);
							}
							
							_.each(item.foodMatch, function(food) {
								if($rootScope.fullData.foodMatches.indexOf(food) === -1) {
									$rootScope.fullData.foodMatches.push(food);
								}
							});
							
							if($rootScope.fullData.regions.indexOf(item.region) === -1) {
								$rootScope.fullData.regions.push(item.region);
							}
						});
						callback(null, results);
					});
				},
// 				varieties: function(callback) {
// 					$scope.getData($scope.baseUrl + $scope.varietyFilterUrl, {}, function(results) {
// 						callback(null, results);
// 					});
// 				},
// 				styles: function(callback) {
// 					$scope.getData($scope.baseUrl + $scope.styleFilterUrl, {}, function(results) {
// 						callback(null, results);
// 					});
// 				},
// 				foodMatches: function(callback) {
// 					$scope.getData($scope.baseUrl + $scope.foodMatchFilterUrl, {}, function(results) {
// 						callback(null, results);
// 					});
// 				},
// 				regions: function(callback) {
// 					$scope.getData($scope.baseUrl + $scope.regionFilterUrl, {}, function(results) {
// 						callback(null, results);
// 					});
// 				},
				recipes: function(callback) {
					$http.jsonp($scope.recipeUrl).success(function(results) {
						var output = results && results.results && results.results.collection1 || [];
						_.each(output, function(item) {
							item.searchText = (item.name.text + ' ' + item.description + ' ' + item.type).toLowerCase();
						});
						callback(null, output);
					});
				}
			}, function(err, results) {
				$rootScope.fullData.products = results.products;
				$rootScope.fullData.recipes = results.recipes;
				$rootScope.fullData.varieties.sort();
				$rootScope.fullData.styles.sort();
				$rootScope.fullData.foodMatches.sort();
				$rootScope.fullData.regions.sort();
				localStorage.setItem('fullData', JSON.stringify($rootScope.fullData));
				callback();
			});
		}
	}
	
	
	$scope.init = function() {
		$ionicLoading.show();
		$scope.loadAllData(true, function() {
			try {
				$cordovaSplashscreen.hide()
			} catch(ex) {
				
			}
			$ionicLoading.hide();
			$state.go('tab.food', null, false);
			console.log($rootScope.fullData);
		});
	}
	
	$timeout(function() {
		$scope.init();
	}, 0);
})



.controller('FoodCtrl', function($rootScope, $scope, $state, $ionicActionSheet) {

	$scope.openWineList = function(foodName) {
		
		 // Show the action sheet
		var actionSheet = $ionicActionSheet.show({
			buttons: [
				{ text: 'View wines' },
				{ text: 'View recipes' }
			],
			titleText: 'View wines or recipes',
			cancelText: 'Cancel',
			buttonClicked: function(index) {
				if(index === 0) {
					$rootScope.tempWineSearch = foodName;
					$state.go('tab.wine', null, false);
				} else {
					$rootScope.tempRecipeSearch = foodName;
					$state.go('tab.recipe', null, false);
				}
				
				return true;
			}
		});

		
	}
	
})




.controller('WineCtrl', function($rootScope, $scope, $http, $timeout, $ionicModal, $ionicLoading, $ionicScrollDelegate) {
	$scope.wineSearch = '';
	$scope.start = 0;
	$scope.counter = 10;
	
	$scope.loadModal = function() {
		$ionicModal.fromTemplateUrl('templates/filter-modal.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal = modal;
		});
	};

	$scope.loadData = function() {
		$ionicLoading.show();
		$scope.clearSearch();
		$timeout(function() {
			$scope.$broadcast('scroll.refreshComplete');
			$ionicLoading.hide();
		}, 1000)
	};
	
	$scope.clearSearch = function() {
		$scope.wineSearch = '';
		$scope.focusSearch = true;
		$timeout(function() {
			$('#search').focus();
			$ionicScrollDelegate.scrollTop();
		}, 0);
	};
	
	$scope.openFilterModal = function($event) {
		$scope.modal.show($event);
		//Cleanup the popover when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.modal.remove();
		});
	};
	
	$scope.closeModal = function($event) {
		$scope.filterProducts();
		$scope.modal.hide($event);
	};
	
	$scope.filterProducts = function() {
		var search = $scope.wineSearch.toLowerCase();
		var products = _.filter($rootScope.fullData.products, function(item) {
			return item.searchText.indexOf(search) > -1 && 
			(
				($rootScope.fullData.selectedVariety === "" || $rootScope.fullData.selectedVariety === item.variety) && 
				($rootScope.fullData.selectedStyle === "" || $rootScope.fullData.selectedStyle === item.style) &&
				($rootScope.fullData.selectedFoodType === "" || $rootScope.fullData.selectedFoodType === item.foodType) &&
				($rootScope.fullData.selectedRegion === "" || $rootScope.fullData.selectedRegion === item.region)
			);
		});
		$scope.products = products.slice($scope.start, $scope.counter);
	};
	
	$scope.loadMore = function() {
		$scope.filterProducts();
		$scope.counter += 10;
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
	
	$scope.$watch('wineSearch', function() {
		$ionicScrollDelegate.scrollTop();
		$scope.filterProducts();
	});
	
	$timeout(function() {
		$scope.loadModal();
		
	}, 0)
	
	$scope.$on('$ionicView.enter', function(e) {
		$scope.search = $rootScope.tempWineSearch;
	});
		
})

.controller('WineDetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicLoading, $timeout) {
	
	$scope.name = $stateParams.name;
	
	$scope.selectedProduct = {};
	
	$scope.init = function() {
		$scope.products = $rootScope.fullData.products;
		$scope.product = _.findWhere($scope.products, { name: $scope.name });
	}
	
	$timeout(function() {
		$scope.init();
	}, 0);
	
})

.controller('RecipeCtrl', function($rootScope, $scope, $http, $timeout, $ionicModal, $ionicLoading, $ionicScrollDelegate) {

	$scope.recipeSearch = '';
	$scope.start = 0;
	$scope.counter = 10;
	
	$scope.loadModal = function() {
		$ionicModal.fromTemplateUrl('templates/filter-modal.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal = modal;
		});
	};

	$scope.clearSearch = function() {
		$scope.recipeSearch = '';
		$scope.focusSearch = true;
		$timeout(function() {
			$('#search').focus();
			$ionicScrollDelegate.scrollTop();
		}, 0);
	};
	
	$scope.filterRecipies = function() {
		var search = $scope.recipeSearch.toLowerCase();
		var recipes = _.filter($rootScope.fullData.recipes, function(item) { 
			return item.searchText.indexOf(search) > -1;
		});
		$scope.recipes = recipes.slice($scope.start, $scope.counter);
	};
	
	$scope.loadMore = function() {
		$scope.filterRecipies();
		$scope.counter += 10;
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
	
	$scope.$watch('recipeSearch', function() {
		$ionicScrollDelegate.scrollTop();
		$scope.filterRecipies();
	});
	
	$scope.$on('$ionicView.enter', function(e) {
		if($rootScope.tempRecipeSearch !== '') {
			$scope.search = $rootScope.tempRecipeSearch;
			$rootScope.tempRecipeSearch = '';
		}
	});
	
})


.controller('RecipeDetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicLoading, $timeout) {
	
	$scope.name = $stateParams.name;
	
	$scope.selectedProduct = {};
	
	$scope.init = function() {
		$scope.recipes = $rootScope.fullData.recipes;
		$scope.recipe = _.find($scope.recipes, function(item) {
			return item.name.text === $scope.name;
		});
	};
	
	$timeout(function() {
		$scope.init();
	}, 0);
	
})


.controller('RoomsCtrl', function($rootScope, $scope, $state, $ionicLoading, $ionicPopup, $timeout, Rooms) {
	

	$scope.loaded = false;
	$ionicLoading.show();
	
	$scope.userModel = {};
	
	$scope.rooms = Rooms.all();
	
	$scope.getChatName = function() {
		var chatName = '';
		if($rootScope.chatName) {
			chatName = $rootScope.chatName;
		} else if(localStorage.getItem('chatName')) {
			chatName = localStorage.getItem('chatName');
		}
		return chatName;
	};
	
	$scope.openChatRoom = function(roomId) {
		var chatName = $scope.userModel.chatName;
		if(chatName && jQuery.trim(chatName) !== '') {
			$rootScope.chatName = chatName;
			localStorage.setItem('chatName', chatName);
			$state.go('tab.rooms-chat', {
				roomId: roomId
			});
		} else {
			$ionicPopup.alert({
				title: 'Oops!',
				template: 'You must enter in a name before selecting a room'
			});
		}
	};
	
	$timeout(function() {
		$scope.userModel.chatName = $scope.getChatName();
		$scope.rooms.$loaded(function() {
			$scope.loaded = true;
			$ionicLoading.hide();
		});
	}, 0)
	
})


.controller('ChatCtrl', function($rootScope, $scope, $timeout, $state, $ionicLoading, $ionicPopup, Chats) {
	
	$scope.room = undefined;
	$scope.chats = [];
	
	$scope.chatModel = {};
	
	$scope.sendMessage = function() {
		var message = $scope.chatModel.message;
		if(message && $.trim(message) !== '') {
			Chats.send($scope.chatName, $scope.chatModel.message);
			$scope.chatModel = {};
		}
	};

	$scope.getChatName = function() {
		var chatName = '';
		if($rootScope.chatName) {
			chatName = $rootScope.chatName;
		} else if(localStorage.getItem('chatName')) {
			chatName = localStorage.getItem('chatName');
		}
		return chatName;
	};
	
	$scope.setChatName = function(name) {
		$scope.chatName = name;
		$rootScope.chatName = name;
		localStorage.setItem('chatName', name);
	};
	
	
	$scope.loadData = function() {
		$scope.loaded = false;
		$ionicLoading.show();
		
		$scope.roomId = $state.params.roomId;
		$scope.room = Chats.selectRoom($scope.roomId);
		$scope.chats = Chats.getChats($scope.roomId);
	
		async.parallel([
			function(callback) {
				$scope.room.$loaded(function() {
					callback(null, true);
				});
			},
			function(callback) {
				$scope.chats.$loaded(function() {
					callback(null, true);
				});
			}
		], function(err, results) {
			console.log($scope.chats);
			$scope.loaded = true;
			$ionicLoading.hide();
		});
	}
	
	$timeout(function() {
		var chatName = $scope.getChatName();
		if(!chatName) {
			$scope.go('tab.rooms');
		} else {
			$scope.loadData();
		}
	}, 0)
	
})

