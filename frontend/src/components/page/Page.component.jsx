import React from 'react';
import styles from './Page.module.scss';
import Navbar from "../navbar/Navbar.component";

const Page = ({children}) => {
  return (
    <>
      <Navbar/>
      <div className={styles.page}>
        {children}
      </div>
    </>
  );
};

export default Page;
