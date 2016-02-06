(function (reframe, Immutable) {
	'use strict';

	function identity(a) {
		return a;
	}

	reframe.registerSub('hasItems', function () {
		return reframe.indexPath(['items']).map(function (items) {
			return items.size > 0;
		})
	});

	reframe.registerSub('activeItemsCount', function () {
		return reframe.indexPath(['items'])
			.map(function (items) {
				return items.filter(function (item) {
					return !item.get('completed');
				}).size;
			});
	});

	reframe.registerSub('itemsIndex', function () {
		return reframe.indexPath(['items'])
			.map(function (items) {
				return items.keySeq().toList()
			})
			.distinctUntilChanged(identity, Immutable.is);
	});

	reframe.registerSub('activeItemsIndex', function () {
		return reframe.indexPath(['items'])
			.map(function (items) {
				return items
					.filter(function (item) {
						return !item.get('completed');
					})
					.map(function (item, idx) {
						return idx;
					})
			})
			.distinctUntilChanged(identity, Immutable.is);
	});

	reframe.registerSub('completedItemsIndex', function () {
		return reframe.indexPath(['items'])
			.map(function (items) {
				return items
					.filter(function (item) {
						return item.get('completed');
					})
					.map(function (item, idx) {
						return idx;
					})
			})
			.distinctUntilChanged(identity, Immutable.is);
	});


	reframe.registerSub('item', function (db, cmd) {
		return reframe.indexPath(['items', cmd[1]]);
	});

	reframe.registerSub('allCompleted', function () {
		return reframe.indexPath(['items']).map(function (items) {
			return items
					.filter(function (item) {
						return item.get('completed');
					})
					.size === items.size && items.size > 0;
		})
	});

	reframe.registerSub('hasCompleted', function () {
		return reframe.indexPath(['items']).map(function (items) {
			return items.filter(function (item) {
					return item.get('completed');
				}).size > 0;
		});
	});

	reframe.registerSub('itemEditing', function (db, cmd) {
		return reframe.indexPath(['editing', cmd[1]], false);
	});

	reframe.registerSub('filter', function () {
		return reframe.indexPath(['filter'], 'all');
	});

})(reframe, Immutable);
