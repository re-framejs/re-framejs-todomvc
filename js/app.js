(function (window, TodoAppView, TodoAppStorage) {
	'use strict';

	// Your starting point. Enjoy the ride!

	var currentFilter = {
		'#/': 'all',
		'#/active': 'active',
		'#/completed': 'completed'
	}[document.location.hash];

	TodoAppStorage.loadState(currentFilter || 'all');
	TodoAppStorage.startSync();
	TodoAppView.render(window.document.getElementById("app"));
	window.document.getElementById('new-todo').focus();
})
(window, TodoAppView, TodoAppStorage);
