var Note = React.createClass({
  handleColorPick: function (event) {
    this.props.onColorPick(event.target.value);
  },

  render: function () {
    var style = { backgroundColor: this.props.color };
    var onColorPick = this.props.onColorPick;
    return (
      <div className="note" style={style}>
        <span className="delete-note" onClick={this.props.onDelete}> x </span>
        {this.props.children}
        <br/>
        <br/>
        <input type="color" value={this.props.color} onChange={this.handleColorPick}/>
      </div>
    );
  }
});

var NoteEditor = React.createClass({
  getInitialState: function () {
    return {
      text: ''
    };
  },

  handleTextChange: function (event) {
    this.setState({ text: event.target.value });
  },

  handleNoteAdd: function () {
    var newNote = {
      text: this.state.text,
      color: '#ffffff',
      id: Date.now()
    }

    this.props.onNoteAdd(newNote);
    this.setState({ text: '' });
  },

  render: function () {
    return (
      <div className="note-editor">
        <textarea
          placeholder="Enter your something here ..."
          className="textarea"
          rows={5}
          value={this.state.text}
          onChange={this.handleTextChange}/>
        <button className="add-button" onClick={this.handleNoteAdd}>Add</button>
      </div>
    );
  }
});

var NotesGrid = React.createClass({
  componentDidMount: function () {
    var grid = this.refs.grid;
    this.msnry = new Masonry( grid, {
      itemSelector: '.note',
      columnWidth: 200,
      gutter: 10,
      isFitWidth: true
    });
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.notes.length !== prevProps.notes.length) {
      this.msnry.reloadItems();
      this.msnry.layout();
    }
  },

  render: function () {
    var onNoteDelete = this.props.onNoteDelete,
      onNoteColorPick = this.props.onNoteColorPick;

    return (
      <div className="notes-grid" ref="grid">
        {
          this.props.notes.map(function (note) {
            return (
              <Note
                key={note.id}
                color={note.color}
                onDelete={onNoteDelete.bind(null, note)}
                onColorPick={onNoteColorPick.bind(null, note)}>
                {note.text}
              </Note>
            );
          })
        }
      </div>
    );
  }
});

var NoteSearcher = React.createClass({
  getInitialState: function () {
    return {
      query: ''
    }
  },

  changeQuery: function (event) {
    this.setState({
      query: event.target.value
    });
  },
  search: function () {
    this.props.handleSearch(this.state.query);
  },

  render: function () {
    return <h2>
        <input type="text" onChange={this.changeQuery}/>
        <button onClick={this.search}>Search</button>
      </h2>;
  }
});

var NotesApp = React.createClass({
  getInitialState: function () {
    return {
      notes: [],

      query: '',
      displayedNotes: []
    };
  },
  componentDidMount: function () {
    var localNotes = JSON.parse(localStorage.getItem('notes'));
    if (localNotes) {
      this.setState({
        notes: localNotes,
        displayedNotes: localNotes
      });
    }
  },
  componentDidUpdate: function () {
    this._updateLocalStorage();
  },


  handleQuerySearch: function (query) {
    var displayedNotes = this.state.notes.filter(function (note) {
      var searchValue = note.text.toLowerCase();
      return searchValue.indexOf(query.toLowerCase()) !== -1;
    });
    this.setState({
      displayedNotes: displayedNotes,
      query: query
    })
  },
  handleNoteDelete: function (note) {
    var noteId = note.id;
    var newNotes = this.state.notes.filter(function (note) {
      return note.id !== noteId;
    });
    var newDisplayedNotes = this.state.displayedNotes.filter(function (note) {
      return note.id !== noteId;
    })
    this.setState({
      notes: newNotes,
      displayedNotes: newDisplayedNotes
    });
  },
  handleNoteAdd: function (newNote) {
    var newNotes = this.state.notes.slice();
    newNotes.unshift(newNote);
    var sendedObj = { notes: newNotes }

    // Including search query logic
    var parsedText = newNote.text.toLowerCase();
    if (parsedText.indexOf(this.state.query.toLowerCase()) !== -1) {
      var newDisplayedNotes = this.state.displayedNotes.slice();
      newDisplayedNotes.unshift(newNote);
      sendedObj.displayedNotes = newDisplayedNotes;
    }
    this.setState(sendedObj);
  },
  handleNoteColorPick: function (note, color) {
    var newNotes = this.state.notes;
    var indexOfNote = newNotes.indexOf(note);
    newNotes[indexOfNote].color = color
    this.setState({ notes: newNotes });
  },
  _updateLocalStorage: function () {
    var notes = JSON.stringify(this.state.notes);
    localStorage.setItem('notes', notes);
  },


  render: function () {
    return (
      <div className="notes-app">
        <h2 className="app-header">NotesApp Version 2</h2>
        <NoteEditor onNoteAdd={this.handleNoteAdd}/>
        <NoteSearcher handleSearch={this.handleQuerySearch}/>
        <NotesGrid
          notes={this.state.notes.length === this.state.displayedNotes.length
            ? this.state.notes
            : this.state.displayedNotes}
          onNoteDelete={this.handleNoteDelete}
          onNoteColorPick={this.handleNoteColorPick}/>
      </div>
    )
  }
});

ReactDOM.render(
  <NotesApp />,
  document.getElementById('mount-point')
);
