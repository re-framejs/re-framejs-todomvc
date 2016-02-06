(function (window, reframe, React, ReactDOM) {
	'use strict';

	function identity(a) {
		return a;
	}
	// Your starting point. Enjoy the ride!

	reframe.registerHandler('create_item', function (db, cmd) {
		return db.updateIn(['items'], Immutable.List(), function (items) {
			return items.push(Immutable.Map({
					completed: false,
					title: cmd[1]
				}
			));
		})
	});

	reframe.registerHandler('complete_all', function (db, cmd) {
		return db.updateIn(['items'], Immutable.List(), function (items) {
			return items.map(function (item) {
				return item.set('completed', true);
			});
		});
	});

	reframe.registerHandler('activate_all', function (db, cmd) {
		return db.updateIn(['items'], Immutable.List(), function (items) {
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

	reframe.registerSub('hasItems', function () {
		return reframe.indexPath(['items'], Immutable.List()).map(function (items) {
			return items.size > 0;
		})
	});

	reframe.registerSub('activeItemsCount', function () {
		return reframe.indexPath(['items']).map(function (items) {
			return items.size;
		});
	});

	reframe.registerSub('itemsIndex', function () {
		return reframe.indexPath(['items'], Immutable.List())
			.map(function (items) {
				return items.keySeq().toList()
			})
			.distinctUntilChanged(identity, Immutable.is);
	});

	reframe.registerSub('activeItemsIndex', function () {
		return reframe.indexPath(['items'], Immutable.List())
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
		return reframe.indexPath(['items'], Immutable.List())
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
		return reframe.indexPath(['items', cmd[1]], Immutable.Map());
	});

	reframe.registerSub('allCompleted', function () {
		return reframe.indexPath(['items'], Immutable.List()).map(function (items) {
			return items
					.filter(function (item) {
						return item.get('completed');
					})
					.size === items.size && items.size > 0;
		})
	});

	reframe.registerSub('hasCompleted', function () {
		return reframe.indexPath(['items'], Immutable.List()).map(function (items) {
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

	var NewTodo = reframe.view('NewTodo', {
		getInitialState: function () {
			return {value: ''};
		},
		_onChange: function (e) {
			this.setState({value: e.target.value});
		},
		_onKeyPress: function (e) {
			var value = this.state.value.trim();
			if (e.key === 'Enter' && value) {
				reframe.dispatch(['create_item', value]);
				this.setState({value: ''});
			}
		},
		render: function () {
			return React.DOM.input({
				className: 'new-todo',
				placeholder: 'What needs to be done?',
				autofocus: true,
				value: this.state.value,
				onChange: this._onChange,
				onKeyPress: this._onKeyPress
			});
		}
	});

	var TodoItem = reframe.view('TodoItem', {
		getInitialState: function () {
			return {value: ''};
		},
		_onChange: function (e) {
			this.setState({value: e.target.value});
		},
		_onBlur: function () {
			this.commitChange();
		},
		_onKeyPress: function (e) {
			if (e.key === 'Enter') {
				this.refs.input.blur();
			}
		},
		commitChange: function () {
			var value = this.state.value.trim();
			if (value) {
				reframe.dispatch(['changeItem', this.props.argv[0], this.state.value]);
			} else {
				reframe.dispatch(['removeItem', this.props.argv[0]]);
			}
		},
		render: function (itemIdx) {
			var item = this.derefSub(['item', itemIdx]);
			var editing = this.derefSub(['itemEditing', itemIdx]);

			var isCompleted = item.get('completed');
			return React.DOM.li({
					className: (isCompleted ? 'completed' : '') + ' ' + (editing ? 'editing' : '')
				},
				React.DOM.div({className: 'view'},
					React.DOM.input({
						className: 'toggle', type: 'checkbox', checked: isCompleted,
						onChange: function () {
							reframe.dispatch(['toggleItem', itemIdx]);
						}
					}),
					React.DOM.label({
						onDoubleClick: function (e) {
							reframe.dispatchSync(['toggleEdit', itemIdx]);
							this.setState({value: item.get('title')}, function () {
								this.refs.input.focus();
							}.bind(this));
						}.bind(this)
					}, item.get('title')),
					React.DOM.button({
						className: 'destroy',
						onClick: function () {
							reframe.dispatch(['removeItem', itemIdx]);
						}
					})
				),
				React.DOM.input({
					className: 'edit',
					ref: 'input',
					value: editing ? this.state.value : item.get('title'),
					onChange: this._onChange,
					onBlur: this._onBlur,
					onKeyPress: this._onKeyPress
				})
			);
		}
	});

	var TodoList = reframe.view('TodoList', function () {
		var filter = this.derefSub(['filter']);
		var itemsIndex;

		if (filter === 'active') {
			itemsIndex = this.derefSub(['activeItemsIndex']);
		} else if (filter === 'completed') {
			itemsIndex = this.derefSub(['completedItemsIndex']);
		} else {
			itemsIndex = this.derefSub(['itemsIndex']);
		}

		return React.DOM.ul({className: 'todo-list'},
			itemsIndex.map(TodoItem).toArray()
		);
	});

	var ToggleAll = reframe.view('ToggleAll', function () {
		var allCompleted = this.derefSub(['allCompleted']);
		return React.DOM.div({},
			React.DOM.input({
				className: 'toggle-all', type: 'checkbox',
				checked: allCompleted,
				onChange: function (e) {
					if (allCompleted) {
						reframe.dispatch(['activate_all']);
					} else {
						reframe.dispatch(['complete_all']);
					}
				}
			}),
			React.DOM.label({htmlFor: 'toggle-all'}, 'Mark all as complete')
		);
	});

	var TodoCount = reframe.view('TodoCount', function () {
		var activeItemsCount = this.derefSub(['activeItemsCount']);
		return React.DOM.span({className: 'todo-count'},
			React.DOM.strong({}, activeItemsCount), activeItemsCount === 1 ? ' item left' : ' items left'
		);
	});

	var Filters = reframe.view('Filters', function () {
		var filter = this.derefSub(['filter']);

		return React.DOM.ul({className: 'filters'},
			React.DOM.li({}, React.DOM.a({
				className: filter === 'all' ? 'selected' : '', href: '#/',
				onClick: function (e) {
					reframe.dispatch(['setFilter', 'all']);
				}
			}, 'All')),
			React.DOM.li({}, React.DOM.a({
				className: filter === 'active' ? 'selected' : '',
				href: '#/active', onClick: function (e) {
					reframe.dispatch(['setFilter', 'active']);
				}
			}, 'Active')),
			React.DOM.li({}, React.DOM.a({
				className: filter === 'completed' ? 'selected' : '',
				href: '#/completed', onClick: function (e) {
					reframe.dispatch(['setFilter', 'completed']);
				}
			}, 'Completed'))
		)
	});

	var ClearCompleted = reframe.view('ClearCompleted', function () {
		var hasCompleted = this.derefSub(['hasCompleted']);
		if (!hasCompleted) {
			return React.DOM.div();
		}
		return React.DOM.button({
			className: 'clear-completed',
			onClick: function () {
				reframe.dispatch(['clearCompleted']);
			}
		}, 'Clear completed');
	});


	var TodoApp = reframe.view('TodoApp', function () {
		var hasItems = this.derefSub(['hasItems']);

		return React.DOM.div({},
			React.DOM.section(
				{className: 'todoapp'},
				React.DOM.header(
					{className: 'header'},
					React.DOM.h1(null, 'todos'),
					NewTodo()),
				React.DOM.section(
					{
						className: 'main',
						style: {
							display: hasItems ? 'block' : 'none'
						}
					},
					ToggleAll(),
					TodoList()
				),
				React.DOM.footer({
						className: 'footer', style: {
							display: hasItems ? 'block' : 'none'
						}
					},
					TodoCount(),
					Filters(),
					ClearCompleted()
				)
			),
			React.DOM.footer({className: 'info'},
				React.DOM.p({}, 'Double-click to edit a todo'),
				React.DOM.p({}, 'Created by', React.DOM.a({href: 'http://tomasd.github.io/'}, 'Tomas Drencak')),
				React.DOM.p({}, 'Part of', React.DOM.a({href: 'http://todomvc.com'}, 'TodoMVC'))
			)
		);
	});
	ReactDOM.render(TodoApp(), window.document.getElementById("app"));
})
(window, reframe, React, ReactDOM);
