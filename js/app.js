(function (window, reframe, React, ReactDOM) {
	'use strict';

	// Your starting point. Enjoy the ride!

	var TodoApp = reframe.view('TodoApp', function () {
		return React.DOM.div({},
			React.DOM.section(
				{className: 'todoapp'},
				React.DOM.header(
					{className: 'header'},
					React.DOM.h1(null, 'todos'),
					React.DOM.input({
						className: 'new-todo',
						placeholder: 'What needs to be done?',
						autofocus: true
					})),
				React.DOM.section(
					{className: 'main'},
					React.DOM.input({className: 'toggle-all', type: 'checkbox'}),
					React.DOM.label({htmlFor: 'toggle-all'}, 'Mark all as complete'),
					React.DOM.ul({className: 'todo-list'},
						React.DOM.li({className: 'completed'},
							React.DOM.div({className: 'view'},
								React.DOM.input({className: 'toggle', type: 'checkbox', checked: true}),
								React.DOM.label(null, 'Taste JavaScript'),
								React.DOM.button({className: 'destroy'})
							),
							React.DOM.input({className: 'edit', value: 'Create a TodoMVC template'})
						),
						React.DOM.li({},
							React.DOM.div({className: 'view'},
								React.DOM.input({className: 'toggle', type: 'checkbox'}),
								React.DOM.label(null, 'Buy a unicorn'),
								React.DOM.button({className: 'destroy'})
							),
							React.DOM.input({className: 'edit', value: 'Rule the web'})
						)
					),
					React.DOM.footer({className: 'footer'},
						React.DOM.span({className: 'todo-count'},
							React.DOM.strong({}, 0),
							' item left'
						),
						React.DOM.ul({className: 'filters'},
							React.DOM.li({}, React.DOM.a({className: 'selected', href: '#/'}, 'All')),
							React.DOM.li({}, React.DOM.a({href: '#/active'}, 'Active')),
							React.DOM.li({}, React.DOM.a({href: '#/completed'}, 'Completed'))
						),
						React.DOM.button({className: 'clear-completed'}, 'Clear completed')
					)
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
})(window, reframe, React, ReactDOM);
