var CreateTodo = React.createClass({
  getInitialState: function() {
    return {
      newTodoText: ''
    };
  },

  changeText: function (event) {
    var text = event.target.value;
    this.setState({
      newTodoText: text
    });
  },
  addTodo: function() {
    this.props.addTodo(this.state.newTodoText);
    this.setState({
      newTodoText: ''
    })
  },

  render: function () {
    return (
      <div className="layout layout-align-center-stretch adder">
        <input onChange={this.changeText} value={this.state.newTodoText} />
        <button onClick={this.addTodo} disabled={this.state.newTodoText.length === 0}>Add TODO</button>
      </div>
    );
  }
});

/* Filters */
var Filters = React.createClass({
  render: function () {
    return (
      <div className="layout layout-align-center-stretch filter">
        <Filter
          label="All"
          checkedFilter={!this.props.filter}
          pickFilter={this.props.filterTodo.bind(null, false)}/>
        <Filter
          label="Completed"
          checkedFilter={this.props.filter === 'done'}
          pickFilter={this.props.filterTodo.bind(null, 'done')}/>
        <Filter
          label="Not completed"
          checkedFilter={this.props.filter === 'undone'}
          pickFilter={this.props.filterTodo.bind(null, 'undone')}/>
      </div>
    );
  }
});
var Filter = React.createClass({
  render: function () {
    return (
      <div>
        <input
          type="radio"
          name="filter"
          onClick={this.props.pickFilter}
          defaultChecked={this.props.checkedFilter}/>
        {this.props.label}
      </div>
    )
  }
});
/* /Filters */

/* Todos */
var TodoList = React.createClass({
  render: function () {
    var deleteTodo = this.props.deleteTodo,
      toggleTodo = this.props.toggleTodoState;

    return (
      <div className="layout layout-align-center">
        <div className="todo-list">
          {
            this.props.todoList.map(function (todo) {
              return (
                <Todo
                  key={todo.id}
                  text={todo.text}
                  completed={todo.completed}
                  deleteTodo={deleteTodo.bind(null, todo)}
                  toggleTodo={toggleTodo.bind(null, todo)} />
              );
            })
          }
        </div>
      </div>
    );
  }
});
var Todo = React.createClass({
  render: function () {
    return (
      <div className="layout layout-align-space-between todo">
        <span className={this.props.completed ? 'crossed-completed-todo' : ''}>{this.props.text}</span>
        <div className="todo-controll-block">
          <button className="toggle-todo" onClick={this.props.toggleTodo}>
            {this.props.completed ? 'Un' : 'D'}one
          </button>
          <button className="delete-todo" onClick={this.props.deleteTodo}>Delete</button>
        </div>
      </div>
    )
  }
});
/* /Todos */

var Application = React.createClass({
  getInitialState: function() {
    return {
      todoList: [],
      todoDisplayed: [],
      filter: false,
    };
  },
  componentDidMount: function () {
    var localData = JSON.parse(localStorage.getItem('todoList'));
    if (localData) {
      this.setState({
        todoList: localData,
        todoDisplayed: localData
      });
    }
  },
  componentDidUpdate: function () {
    this._updateLocalStorage();
  },

  addTodo: function (todoText) {
    var newTodo = {
      text: todoText,
      completed: false,
      id: Date.now()
    };
    var newTodoList = this.state.todoList.slice();
    newTodoList.unshift(newTodo);
    var sendedObj = { todoList: newTodoList };

    // Including filter logic
    if (!this.state.filter || this.state.filter === 'undone') {
      var newTodoDisplayed = this.state.todoDisplayed.slice();
      newTodoDisplayed.unshift(newTodo);
      sendedObj.todoDisplayed = newTodoDisplayed;
    }
    this.setState(sendedObj);
  },
  deleteTodo: function (removed) {
    var removedId = removed.id;
    var newTodoList = this.state.todoList.filter(function (todo) {
      return todo.id !== removedId;
    });
    var newTodoDisplayed = this.state.todoDisplayed.filter(function (todo) {
      return todo.id !== removedId;
    });

    this.setState({
      todoList: newTodoList,
      todoDisplayed: newTodoDisplayed
    });
  },
  toggleTodoState: function (changed) {
    var newTodoList = this.state.todoList.map(function (todo) {
      if (todo.id === changed.id) {
        todo.completed = !todo.completed;
      }

      return todo;
    });
    this.setState({
      todoList: newTodoList
    });
  },
  filterTodo: function (filter) {
    var filteredList = this.state.todoList.filter(function (todo) {
      if (filter === 'done') {
        return todo.completed;
      } else if (filter === 'undone') {
        return !todo.completed;
      }

      return true;
    });

    this.setState({
      todoDisplayed: filteredList,
      filter: filter
    });
  },
  _updateLocalStorage: function () {
    var todoList = JSON.stringify(this.state.todoList);
    localStorage.setItem('todoList', todoList);
  },

  render: function () {
    return (
      <div className="application">
        <h1>TODO list application</h1>
        <CreateTodo addTodo={this.addTodo} />
        <Filters
          filterTodo={this.filterTodo}
          filter={this.filter} />
        <TodoList
          todoList={this.state.todoDisplayed}
          deleteTodo={this.deleteTodo}
          toggleTodoState={this.toggleTodoState} />
      </div>
    );
  }
});

ReactDOM.render(
  <Application />,
  document.getElementById('mount-point')
);
