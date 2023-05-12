/*
* This is the most root level item, which serves as the mount for the whole site.
* */

import React from 'react';
import ReactDOM from 'react-dom';
import DOMPurify from 'dompurify';
import './index.css';
import * as serviceWorker from "./utils/serviceWorker";

import App from "./App";

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe") {
    const src = node.getAttribute("src") || "";
    if (!src.startsWith("https://www.youtube.com/embed/")) {
      return node.parentNode.removeChild(node);
    }
  }
});

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

serviceWorker.unregister();
