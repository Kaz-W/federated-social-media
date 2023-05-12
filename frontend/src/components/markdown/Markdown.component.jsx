import React from 'react';
import styles from './Markdown.module.scss'
import DOMPurify from "dompurify";
import ReactMarkdown from 'react-markdown';
import * as PropTypes from "prop-types";

const Markdown = ({ children, className, allowHtml }) => {

  const sanatized= DOMPurify.sanitize(children, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
  });

    return (
    <ReactMarkdown escapeHtml={!allowHtml} className={`${styles.markdown} ${className}`}>{sanatized}</ReactMarkdown>
  );
};

Markdown.propTypes = {
  className: PropTypes.string,
  allowHtml: PropTypes.bool
}

Markdown.defaultProps = {
  className: '',
  allowHtml: false
}

export default Markdown;
