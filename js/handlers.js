(function (reframe, Immutable) {
	'use strict';

	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}

	// Generate a pseudo-GUID by concatenating random hexadecimal.
	function guid() {
		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	}

	reframe.regCofx('localStore', function (cofx, item) {
		return cofx.setIn(['localStore', item], Immutable.fromJS(JSON.parse(localStorage.getItem(item))));
	});

	reframe.regFx('localStore', function (items) {
		Object.keys(items).forEach(function (key) {
			var value = items[key];
			var jsonValue = value && value.toJSON ? value.toJSON() : value;
			var jsonString = JSON.stringify(jsonValue);
			localStorage.setItem(key, jsonString);
		});
	});

	var persistItems = reframe.toInterceptor({
		id: 'persist-items',
		after: function (ctx) {
			var localStore = reframe.getEffect(ctx, 'localStore') || {};
			localStore['todos-reframejs'] = reframe.getEffect(ctx, 'db').get('items').valueSeq().toList();
			return reframe.assocEffect(ctx, 'localStore', localStore);
		}
	});

	var common = [reframe.when(function () {
		return window.debug;
	}, reframe.debug)];

	reframe.regEventFx('resetDb',
		[common, reframe.injectCofx('localStore', 'todos-reframejs')],
		function ({localStore}, cmd) {
			return {
				db: Immutable.Map({
					items: (localStore.get('todos-reframejs') || Immutable.List()).reduce(function (acc, item) {
						return acc.set(item.get('id'), item);
					}, Immutable.OrderedMap()),
					filter: cmd[1] || 'all',
					editing: Immutable.Map()
				})
			};
		});

	reframe.regEventDb('create_item', [common, persistItems], function (db, cmd) {
		var id = guid();

		return db
			.setIn(['items', id], Immutable.Map({
				id: id,
				created: Date.now(),
				completed: false,
				title: cmd[1]
			}));
	});

	reframe.regEventDb('complete_all', [common, persistItems], function (db, cmd) {
		return db.updateIn(['items'], function (items) {
			return items.map(function (item) {
				return item.set('completed', true);
			});
		});
	});

	reframe.regEventDb('activate_all', [common, persistItems], function (db, cmd) {
		return db.updateIn(['items'], function (items) {
			return items.map(function (item) {
				return item.set('completed', false);
			});
		});
	});

	reframe.regEventDb('toggleItem', [common, persistItems], function (db, cmd) {
		return db.updateIn(['items', cmd[1], 'completed'], function (completed) {
			return !completed;
		});
	});

	reframe.regEventDb('toggleEdit', common, function (db, cmd) {
		var value = cmd[2] === undefined ? !db.getIn(['editing', cmd[1]], false) : cmd[2];
		return db.set('editing', Immutable.Map().set(cmd[1], value));
	});

	reframe.regEventDb('changeItem', [common, persistItems], function (db, cmd) {
		return db
			.setIn(['items', cmd[1], 'title'], cmd[2])
			.set('editing', Immutable.Map());
	});

	reframe.regEventDb('removeItem', [common, persistItems], function (db, cmd) {
		return db
			.removeIn(['items', cmd[1]])
			.set('editing', Immutable.Map());
	});

	reframe.regEventDb('clearCompleted', [common, persistItems], function (db) {
		return db.update('items', function (items) {
			return items.filter(function (item) {
				return !item.get('completed');
			});
		});
	});

	reframe.regEventDb('setFilter', common, function (db, cmd) {
		return db.set('filter', cmd[1]);
	});
})(reframe, Immutable);
