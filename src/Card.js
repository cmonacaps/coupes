import React from 'react';

import * as R from 'ramda';

import {useDispatch, useSelector} from 'react-redux'

import Stepper from './Stepper'

import Styles from './Card.module.css';

const log = require ('ololog').configure ({ stringify: { indentation: ' ' } }) ;

const Card = props => {
  const dispatch = useDispatch()

  const [currentCard, isFirst, isLast] = useSelector(
    state => (flat =>
      [
        R.nth(
          state.currentCardIndex,
          flat
        ),
        R.equals(0)(state.currentCardIndex),
        R.equals(R.dec(R.length(flat)))(state.currentCardIndex)
      ])(R.flatten(state.cardSequence))
  )

  const [state, structure] = useSelector(
    R.converge(
      R.pair,
      [
        R.view(R.lensPath(['cards', currentCard])),
        R.view(R.lensPath(['structure', 'cards', currentCard]))
      ]
    )
  )

  const { logic } = R.defaultTo({}, structure);

  const onChange = ev => dispatch(
    {
      type: 'UPDATE_VAL',
      payload: {
        card: state.name,
        value: R.view(R.lensPath(['target', 'value']))(ev)
      }
    })

  const navPrev = () => dispatch(
    {
      type: 'NAV_PREV',
      payload: { }
    })

  const navNext = () => dispatch(
    {
      type: 'NAV_NEXT',
      payload: { }
    })

  const NBSP = '\u00A0';

  return (
    <div className={Styles.card}>
      <div className={Styles.title}>{`Card ${state.name}`}</div>
      <div className={Styles.cardContent}>
        <div className={Styles.inputContainer}>
          <div className={Styles.inputLabel}>User Input</div>
          <input className={Styles.input} onChange={onChange}/>
        </div>
        <div className={Styles.logicDescription}>
          {logic ? logic.description : NBSP}
        </div>
        <div className={Styles.nav}>
          <input className={Styles.input} type="button" value="previous" disabled={isFirst} onClick={navPrev}/>
          <input className={Styles.input} type="button" value="next" disabled={isLast} onClick={navNext}/>
        </div>
      </div>
      <Stepper />
    </div>
  )
}

export default Card;