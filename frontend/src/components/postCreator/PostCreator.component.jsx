import React, {Component} from 'react';
import styles from './PostCreator.module.scss';
import api from "../../utils/api";
import ProtectedComponent from "../protectedComponent/ProtectedComponent.component";
import Button from "../button/Button.component";
import InputText from "../input/inputText/InputText.component";
import InputTextarea from "../input/inputTextarea/InputTextarea.component";
import withUser from "../withUser/WithUser.component";

/*
* Component for authoring posts and sending the data.
* */
class PostCreator extends Component {

  constructor(props) {
    super(props);

    this.state = {title: '', content: ''};

    this.submitHook = this.props.submitHook;

    // Have to bind events in React like this.
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // On form update, update the component state so it tracks the data in the form.
  handleChange(e) {
    this.setState({[e.target.id]: e.target.value})
  }

  // On form submit, don't reload the page, just get the data in state and send it.
  async handleSubmit(e) {
    e.preventDefault();

    // Package the data in a form the forums will understand it. (The same for now but could be different).
    let { title, content } = this.state;
    let data = {
      postTitle: title,
      postContents: content,
      username: this.props.userContext.user.username,
      postType: "markdown"
    }
    // unpack subforum ID from subforum object in props
    const {subforumObject} = this.props;
    await api.relay.post(subforumObject._links.posts.href, data);
    this.submitHook(subforumObject);
  }

  render() {
    const { disabled } = this.props;
    return (
      <ProtectedComponent action='make a post' align='m'>
        <form className={styles.post_creator}>
          <InputText className={styles.post_title} placeholder='Post Title' id='title' type='text' value={this.state.title} onChange={this.handleChange}/>
          <InputTextarea placeholder='Post Content...' id='content' value={this.state.content} onChange={this.handleChange}/>
          <Button onClick={this.handleSubmit} colour="primary" disabled={disabled}><i>Post</i></Button>
        </form>
      </ProtectedComponent>
    );
  }
}

export default withUser(PostCreator);
