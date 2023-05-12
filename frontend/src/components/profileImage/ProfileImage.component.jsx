import React from 'react';
import * as PropTypes from "prop-types";
import styles from './ProfileImage.module.scss';

const ProfileImage = ({ imageURL, username, size, border, className }) => {

  const sizeClass = styles[`s_${size}`] ?? styles.s_normal;
  const borderClass = border ? styles["border"] : "";

  if (Boolean(imageURL)) {
    return (
      <img src={imageURL} alt={username} className={`${styles.profile_image} ${sizeClass} ${borderClass} ${className}`}/>
    );
  } else {
    return (
      <div className={`${styles.profile_image} ${sizeClass} ${borderClass} ${className}`}/>
    );
  }
};

ProfileImage.propTypes = {
  imageURL: PropTypes.string,
  username: PropTypes.string,
  size: PropTypes.oneOf(["small", "normal", "large"]),   // 25px, 48px, 100px
  border: PropTypes.bool
}

ProfileImage.defaultProps = {
  imageURL: null,
  username: "",
  size: "normal",
  border: false
}

export default ProfileImage;
