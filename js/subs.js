(function (reframe, Immutable) {
	'use strict';

	function identity(a) {
		return a;
	}

	reframe.regSub('todo/items', function (db) {
		return db.get('items', Immutable.List());
	});

	reframe.regSub(
		'todo/completed-items',
		() => reframe.subscribe(['todo/items']),
		function (items) {
			return items.filter(function (item) {
				return item.get('completed');
			});
		});

	reframe.regSub(
		'todo/active-items',
		() => reframe.subscribe(['todo/items']),
		function (items) {
			return items.filter(function (item) {
				return !item.get('completed');
			});
		});

	function regItemsSub(id, fn) {
		reframe.regSub(
			id,
			function () {
				return reframe.subscribe(['todo/items']);
			},
			fn
		);
	}

	function regCompletedItemsSub(id, fn) {
		reframe.regSub(
			id,
			function () {
				return reframe.subscribe(['todo/completed-items']);
			},
			fn
		);
	}

	function regActiveItemsSub(id, fn) {
		reframe.regSub(
			id,
			function () {
				return reframe.subscribe(['todo/active-items']);
			},
			fn
		);
	}


	regItemsSub('todo/hasItems', function (items) {
		return items.size > 0;
	});

	regActiveItemsSub('todo/activeItemsCount', function (items) {
		return items.size;
	});


	regItemsSub('todo/itemsIndex', function (items) {
		return items.keySeq().toList()
	});

	regActiveItemsSub('todo/activeItemsIndex', function (items) {
		return items.map(function (item, idx) {
			return idx;
		});
	});

	regCompletedItemsSub('todo/completedItemsIndex', function (items) {
		return items.map(function (item, idx) {
			return idx;
		});
	});


	regItemsSub('todo/item', function (items, cmd) {
		const itemId = cmd[1];
		return items.get(itemId);
	});

	regItemsSub('todo/allCompleted', function (items) {
		return items
				.filter(function (item) {
					return item.get('completed');
				})
				.size === items.size && items.size > 0;
	});

	regCompletedItemsSub('todo/hasCompleted', function (items) {
		return items.size > 0;
	});

	reframe.regSub('todo/itemEditing', function (db, cmd) {
		return db.getIn(['editing', cmd[1]], false);
	});

	reframe.regSub('todo/filter', function (db) {
		return db.get('filter', 'all');
	});

})(reframe, Immutable);
