import React, {Component} from 'react';
import {Panel, Button, Col, ListGroup, ListGroupItem} from 'react-bootstrap';
import Gun from 'gun';
import _ from 'lodash';

import NoteForm from './NoteForm';

const newNote = {id: '', title: '', text:''};

class Home extends Component {
  constructor({gun}) {
    super()
    this.gun = gun;
    this.notesRef = gun.get('notes');
    
    this.state = { notes: [], currentId: ''};
  }

  componentWillMount() {
    let notes = this.state.notes;
    const self = this;
    this.gun.get('notes').on((n) => {
      var idList = _.reduce(n['_']['>'], function(result, value, key) {
        if(self.state.currentId === '') {
          self.setState({currentId: key});
        }

        let data = { id: key, date: value};
        self.gun.get(key).on((note, key) => {
          const merged = _.merge(data, _.pick(note, ['title', 'text']));
          const index = _.findIndex(notes, (o)=>{ return o.id === key});
          if(index >= 0) {
            notes[index] = merged;
          }else{
            notes.push(merged);
          }
          self.setState({notes});
        })  
      }, []);
    })
  }

  newNoteBtnClick () {
    this.setState({currentId: ''});
  }

  itemClick (event) {
    this.setState({currentId: event.target.id});
  }

  getCurrentNote() {
    const index = _.findIndex(this.state.notes, (o) => { return o.id === this.state.currentId});
    const note = this.state.notes[index] || newNote;
    return note;
  }

  getNoteItem(note) {
    return (<ListGroupItem key={note.id} id={note.id} onClick={this.itemClick.bind(this)}>
      {note.title}
    </ListGroupItem>)
  }

  onSaveClick(data) {
    const note = _.pick(data, ['title', 'text']);
    if(data.id !== '') {
      this.gun.get(data.id).put(note);  
    }else{
      this.notesRef.set(this.gun.put(note))
    }
  }

  render() {
    this.getCurrentNote = this.getCurrentNote.bind(this);
    return (
      <div>
        <Col xs={4} >
          <Panel defaultExpanded header='Notes'>
            <Button bsStyle="primary" block onClick={this.newNoteBtnClick.bind(this)}>New Note</Button>
            <ListGroup fill>
              {this.state.notes.map(this.getNoteItem.bind(this))}
            </ListGroup>
          </Panel>
        </Col>
        <Col xs={8}>
          <NoteForm note={this.getCurrentNote()} onSaveClick={this.onSaveClick.bind(this)}/>
        </Col>
      </div>
    );
  }
}

export default Home;