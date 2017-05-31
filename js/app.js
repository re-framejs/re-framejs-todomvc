(function (window, TodoAppView, reframe) {
	'use strict';

	// Your starting point. Enjoy the ride!

	function currentFilter() {

		var filter = {
			'#/': 'all',
			'#/active': 'active',
			'#/completed': 'completed'
		}[window.document.location.hash];
		return filter || 'all';
	}

	window.onhashchange = function () {
		reframe.dispatch(['setFilter', currentFilter()]);
	};

	reframe.dispatchSync(['resetDb', currentFilter()]);

	TodoAppView.render(window.document.getElementById("app"));
	window.document.getElementById('new-todo').focus();
})
(window, TodoAppView, reframe);
