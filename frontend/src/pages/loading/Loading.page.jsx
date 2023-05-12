import React, {useEffect, useState} from 'react';
import styles from './Loading.module.scss';
import * as PropTypes from 'prop-types';
import Spinner from "../../components/spinner/Spinner.component";

const LoadingPage = ({ mounted }) => {

  const [ visible, setVisible ] = useState(true);
  const [ style, setStyle ] = useState('');

  useEffect(() => {
    if (!mounted) {
      setTimeout(() => setStyle(styles.hidden), 200);
    } else {
      setStyle('');
    }
  }, [mounted]);

  function onTransitionEnd() {
    if (!mounted) setVisible(false);
  }

  return (
    visible &&
    <div className={`${styles.loading} ${style}`} onTransitionEnd={onTransitionEnd}>
      <Spinner size="large"/>
    </div>
  );
};

LoadingPage.propTypes = {
  mounted: PropTypes.bool.isRequired
}

export default LoadingPage;
