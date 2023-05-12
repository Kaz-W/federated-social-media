import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './Expandable.module.scss';

class Expandable extends Component {

  constructor(props) {
    super(props);

    const { expanded } = this.props;

    this.state = {
      expanded: expanded === undefined ? false : expanded
    }

    this.toggleExpanded = this.toggleExpanded.bind(this);
  }

  toggleExpanded() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  render() {
    const { children, label } = this.props;
    const { expanded } = this.state;

    const open = (
      <div className={styles.expandable}>
        <p onClick={this.toggleExpanded} className={styles.btn}>
          <i className="fas fa-minus-square"/>
        </p>
        {children}
      </div>
    );

    const closed = (
      <div className={styles.expandable}>
        <p onClick={this.toggleExpanded} className={styles.btn}>
          <i className="fas fa-plus-square"/>
        </p>
        <p className={styles.label}>{label}</p>
      </div>
    )

    return (
      <div>
        {expanded ? open : closed}
      </div>
    );
  }
}

Expandable.propTypes = {
  expanded: PropTypes.bool,
};

export default Expandable;
