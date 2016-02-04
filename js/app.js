(function (window, reframe, React, ReactDOM) {
	'use strict';

	// Your starting point. Enjoy the ride!

	var TodoApp = reframe.view('TodoApp', function () {
		return React.DOM.section(
			{className: 'todoapp'},
			React.DOM.header(
				{className: 'header'},
				React.DOM.h1(null, 'todos'),
				React.DOM.input({
					className: 'new-todo',
					placeholder: 'What needs to be done?',
					autofocus: true })
			)
		);
	});
	ReactDOM.render(TodoApp(), window.document.getElementById("app"));
})(window, reframe, React, ReactDOM);
