import React, {useEffect, useState} from 'react';
import api from '../../utils/api';
import Container from "../../components/container/Container.component";
import Posts from "../../components/posts/Posts.component";
import {Link, useParams} from "react-router-dom";
import Spinner from "../../components/spinner/Spinner.component";
import NotFound from "../notFound/NotFound.page";
import {auth} from "../../services/auth.service";
import PropTypes from "prop-types";
import styles from './Profile.module.scss';
import FormatDate from "../../services/date.service";
import Button from "../../components/button/Button.component";
import MessageBanner from "../../components/messageBanner/MessageBanner.component";
import withUser from "../../components/withUser/WithUser.component";
import ProfileImage from "../../components/profileImage/ProfileImage.component";
import Page from "../../components/page/Page.component";

const ProfilePage = ( {userContext} ) => {

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const [desc, setDesc] = useState("");       // user profile description
  const [image, setImage] = useState("");     // user profile image URL
  const [edit, setEdit] = useState(false);    // for whether to edit or not
  const [error, setError] = useState(false);  // whether or not the update failed
  const { profileUrl } = useParams();
  const isSelf = !profileUrl;  // whether or not to show private options

  useEffect(() => {
    // console.log("ProfilePage:", userContext);
    async function fetchUserInfo() {
      let postLink = null;   // the link to get the user's post

      // If a profile URL is given, use that to find the user
      if (profileUrl) {
        let profileLink = decodeURIComponent(profileUrl);
        const res = await api.relay.get(profileLink);

        if (res.ok) { // if user exists, find posts + set description
          setUser(res.data);
          setDesc(res.data.description ?? "");
          setImage(res.data.profileImageURL ?? "");
          postLink = res.data._links.self.href + '/posts';
        }
      }
      // If no profile URL is given, get information from userContext instead
      else {
        if (userContext) {
          setUser(userContext.user);
          setDesc(userContext.user.description ?? "");
          setImage(userContext.user.profileImageURL ?? "");
          postLink = userContext.user._links.self.href + '/posts';
        } else {
          // if no userContext exists, automatically sign out
          console.error("Uh oh, auth token expired - automatically signing out");
          auth.signout();
        }
      }

      if (postLink) { // if postLink has been set, find posts as well
        const postRes = await api.relay.get(postLink);
        if (postRes.ok) {
          setPosts(postRes.data._embedded.postList);
        }
      }
      // Finished loading
      setLoading(false);
    }

    fetchUserInfo();
  }, [profileUrl]);

  // If user null, show loading or an error page
  if (user === null) {
    return (isLoading)
      ? <Container><Spinner/></Container>
      : (<NotFound header={"User Not Found"}/>)
  }

  // Otherwise, load the page as appropriate, depending on which page is given
  const birthDate = FormatDate.formatBirthday(new Date(user.createdTime));
  const totalPosts = (posts) ? posts.length : "Counting...";
  const description = (!!user.description) ? user.description : "[No description]";

  const userURI = `/profile/${encodeURIComponent(user._links.self.href)}`;  // private-to-public link

  // Functions called by buttons
  const toggleEdit = () => { setEdit(!edit); }
  const changeDesc = (e) => { setDesc(e.target.value); }
  const changeImage = (e) => { setImage(e.target.value); }

  const updateDesc = async (save) => {
    if (save) { // make a patch request with new description + profile image URL
      let res = await api.patch(`/internal/users/${user.id}`, {description: desc, profileImageURL: image});
      if (res.ok) {
        user['description'] = desc;
        user['profileImageURL'] = image;
      }
      else {  // Failed to update; set error and do not end the edit
        setError(true);
        return;
      }

    } else {  // discard changes + reset fields
      setDesc(user.description);
      setImage(user.profileImageURL);
    }
    toggleEdit();
  }

  return (
    <Page>
      <Container>
        {isLoading ? <Spinner/> :
        <div className={styles.profile_header}>
          <div className={styles.profile_info_left}>
            <h1>{isSelf ? "Your" : `${user.username}'s`} Profile</h1>
            {edit
            ? <form className={styles.profile_form}>
                <label>
                  Description<br/>
                  <input type="textarea" value={desc} onChange={changeDesc}/>
                </label>
                <label>
                  Profile Image URL<br/>
                  <input type="textarea" value={image} onChange={changeImage}/>
                </label>
              </form>
            : <p className={styles.profile_desc}>{description}</p>
            }
          </div>
          <div className={styles.profile_info_right}>
            <ProfileImage imageURL={image} size={"large"} border={true} className={styles.profile_pic} />
            <div className={styles.profile_stat}>Cake day: {birthDate}</div>
            <div className={styles.profile_stat}>Biotin Posts: {totalPosts}</div>
            {isSelf &&
              <Link className={styles.profile_link} to={userURI}>(View public profile)</Link>
            }
          </div>
        </div>
        }
        { /* Edit buttons: `Edit` or `Discard/Save` */
          isSelf && (edit
          ? <div className={styles.actions_container}>
              <Button onClick={() => updateDesc(false)} colour={"danger"}><span>Discard</span></Button>
              <Button onClick={() => updateDesc(true)}><span>Save</span></Button>
            </div>
          : <div className={styles.actions_container}>
              <Button onClick={toggleEdit}><span>Edit...</span></Button>
            </div>
          )
        }
        { /* Edit error*/
          error && <MessageBanner status={"error"}>Edit failed</MessageBanner>
        }
        <hr/>
        <h2>Recent Posts on This Server</h2>
        {isLoading ? <Spinner/> : <Posts data={posts} limit={5}/>}
      </Container>
    </Page>
  );
}

ProfilePage.propTypes = {
  profileUrl: PropTypes.string,
}

export default withUser(ProfilePage);
