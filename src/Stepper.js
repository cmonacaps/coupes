import React from 'react';

import * as R from 'ramda';

import { useSelector } from 'react-redux'

import classNames from 'classnames';

import Styles from './Stepper.module.css';

const Step = ({cardName, isCurrent}) =>
  (<div className={isCurrent ? classNames(Styles.step, Styles.current) : Styles.step}>
    {cardName}
  </div>);

const Stepper = props => {
  const [currentCardIndex, cardSequence] = useSelector(
    state =>
      R.pipe(
        R.pick(['currentCardIndex', 'cardSequence']),
        R.values
      )(state)
  )

  const flat = R.flatten(cardSequence);

  const isCurrent = R.equals(R.nth(currentCardIndex, flat))

  return (
    <div className={Styles.stepper}>
      { R.map(
          cardName => (<Step key={cardName} {...{cardName, isCurrent: isCurrent(cardName)}} />),
          flat) }
    </div>)
}

export default Stepper;