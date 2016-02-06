window.TodoAppView = (function (window, reframe, React, ReactDOM) {
	'use strict';


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
				id: 'new-todo',
				className: 'new-todo',
				placeholder: 'What needs to be done?',
				autofocus: true,
				value: this.state.value,
				onChange: this._onChange,
				onKeyPress: this._onKeyPress
			});
		}
	});

	var TodoItem = reframe.viewSP('TodoItem', {
		getInitialState: function () {
			return {
				value: '',
				commitOnBlur: false
			};
		},
		_onChange: function (e) {
			this.setState({value: e.target.value});
		},
		_onBlur: function () {
			if (this.state.commitOnBlur) {
				this.commitChange();
			}
		},
		_onKeyPress: function (e) {
			if (e.key === 'Enter') {
				this.refs.input.blur();
			}
			if (e.key === 'Escape') {
				this.setState({commitOnBlur: false})
				reframe.dispatch(['toggleEdit', this.props.id, false]);
			}
		},
		commitChange: function () {
			var value = this.state.value.trim();
			if (value) {
				reframe.dispatch(['changeItem', this.props.id, this.state.value]);
			} else {
				reframe.dispatch(['removeItem', this.props.id]);
			}
		},
		render: function () {
			var itemIdx = this.props.id;
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
							this.setState({
								value: item.get('title'),
								commitOnBlur: true
							}, function () {
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
					onKeyDown: this._onKeyPress
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
			itemsIndex.map(function (id) {
				return TodoItem({id: id, key: id});
			}).toArray()
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

		return React.DOM.section(
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
		);
	});
	return {
		render: function (element) {
			return ReactDOM.render(TodoApp(), element);
		}
	}
})
(window, reframe, React, ReactDOM);
