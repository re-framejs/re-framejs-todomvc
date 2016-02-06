(function (reframe, Immutable) {
	'use strict';

	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};

	// Generate a pseudo-GUID by concatenating random hexadecimal.
	function guid() {
		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	};

	reframe.registerHandler('initDb', function (db) {
		return Immutable.Map({
			items: Immutable.OrderedMap(),
			filter: 'all',
			editing: Immutable.Map()
		});
	});
	reframe.dispatchSync(['initDb']);

	reframe.registerHandler('resetDb', function (db, cmd) {
		return db
			.set('items', cmd[1].reduce(function (acc, item) {
				return acc
					.set(item.id, Immutable.Map(item));
			}, Immutable.OrderedMap()))
			.set('filter', cmd[2] || 'all');
	});

	reframe.registerHandler('create_item', function (db, cmd) {
		var id = guid();

		return db
			.setIn(['items', id], Immutable.Map({
				id: id,
				created: Date.now(),
				completed: false,
				title: cmd[1]
			}));
	});

	reframe.registerHandler('complete_all', function (db, cmd) {
		return db.updateIn(['items'], function (items) {
			return items.map(function (item) {
				return item.set('completed', true);
			});
		});
	});

	reframe.registerHandler('activate_all', function (db, cmd) {
		return db.updateIn(['items'], function (items) {
			return items.map(function (item) {
				return item.set('completed', false);
			});
		});
	});

	reframe.registerHandler('toggleItem', function (db, cmd) {
		return db.updateIn(['items', cmd[1], 'completed'], function (completed) {
			return !completed;
		});
	});

	reframe.registerHandler('toggleEdit', function (db, cmd) {
		var value = cmd[2] === undefined ? !db.getIn(['editing', cmd[1]], false) : cmd[2];
		return db.set('editing', Immutable.Map().set(cmd[1], value));
	});

	reframe.registerHandler('changeItem', function (db, cmd) {
		return db
			.setIn(['items', cmd[1], 'title'], cmd[2])
			.set('editing', Immutable.Map());
	});

	reframe.registerHandler('removeItem', function (db, cmd) {
		return db
			.removeIn(['items', cmd[1]])
			.set('editing', Immutable.Map());
	});

	reframe.registerHandler('clearCompleted', function (db) {
		return db.update('items', function (items) {
			return items.filter(function (item) {
				return !item.get('completed');
			});
		});
	});

	reframe.registerHandler('setFilter', function (db, cmd) {
		return db.set('filter', cmd[1]);
	});
})(reframe, Immutable);
