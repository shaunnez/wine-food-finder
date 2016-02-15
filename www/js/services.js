angular.module('starter.services', [])

.factory('Rooms', function($firebase, $firebaseArray) {
	var ref = new Firebase('https://wine-food-finder.firebaseio.com/rooms');

	return {
		ref: ref,
		all: function () {
			return $firebaseArray(ref);
		},
		get: function (roomId) {
			window.abcdefg = $firebaseArray(ref);
			// Simple index lookup
			return $firebaseArray(ref).$getRecord(roomId);
		}
	}
})

.factory('Chats', function($firebase, $firebaseArray, $firebaseObject, Rooms) {
	var selectedRoomId,
		selectedRoom,
		selectedRoomName,
		chats = [],
		room,
		ref = new Firebase('https://wine-food-finder.firebaseio.com/rooms');
	
	return {
		ref: ref,
		all: function() {
			return chats;
		},
		selectRoom: function(roomId) {
			room = $firebaseObject(ref.child(roomId));
			return room;
		},
		getChats: function(roomId) {
			chats = $firebaseArray(ref.child(roomId).child('chats').orderByChild('createdAt').limitToLast(50));
			return chats;
		},
		send: function(name, message) {
			if(name && message) {
				var message = {
					name: name,
					message: message,
					createdAt: Firebase.ServerValue.TIMESTAMP
				};
				
				chats.$add(message).then(function() {
					console.log('message added');
				})
			}
		}
	}

});
