window.TodoAppStorage = (function (reframe, localStorage) {
	'use strict';

	function identity(a) {
		return a;
	}

	return {
		startSync: function () {
			reframe.db$
				.skip(1)
				.debounce(500)
				.map(function (db) {
					return db.get('items');
				})
				.distinctUntilChanged(identity, Immutable.is)
				.subscribe(function(items) {
					localStorage.setItem('todos-reframejs', JSON.stringify(items.valueSeq().toJS()));
				});
				//.scan(function (acc, newItems) {
				//	var ids = newItems.keySeq().toSet();
				//	return {
				//		current: newItems,
				//		ids: ids,
				//		remove: acc.ids.subtract(ids),
				//		update: newItems.filter(function (item) {
				//			return item !== acc.current.get(item.get('id'));
				//		})
				//	};
				//}, {
				//	current: Immutable.OrderedMap(),
				//	ids: Immutable.Set()
				//})
				//.subscribe(function (acc) {
				//	localStorage.setItem('todos-reframejs', JSON.stringify(acc.ids.toJS()));
                //
				//	acc.remove.forEach(function (id) {
				//		localStorage.removeItem('todos-reframejs-' + id);
				//	});
				//	acc.update.forEach(function (item) {
				//		localStorage.setItem('todos-reframejs-' + item.get('id'), JSON.stringify(item.toJS()));
				//	});
				//});
		},
		loadState: function (initFilter) {
			if (localStorage) {
				var items = JSON.parse(localStorage.getItem('todos-reframejs')) || [];

				reframe.dispatchSync(['resetDb', items, initFilter]);
			} else {
				reframe.dispatchSync(['resetDb', [], initFilter]);
			}
		}
	};


})
(reframe, localStorage);
