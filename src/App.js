import React from 'react';

import * as R from 'ramda';

import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware } from 'redux'

import { logicMiddleware } from './logicMiddleware';
import Card from './Card'

import './App.css';

const log = require ('ololog').configure ({ stringify: { indentation: ' ' } }) ;

const makeMockupCard = cardTag =>
    ({
      name: cardTag,
      userInput: '',
      serviceResultWhenSubmitted: ''
    })

const multicat = R.reduce(R.concat, [])

const makeMockupCards = initialStateWithoutCards =>
    R.set(
      R.lensProp('cards'),
      R.fromPairs(
        R.map(
          cardTag => [cardTag, makeMockupCard(cardTag)],
          multicat(
            R.append(
              initialStateWithoutCards.cardSequence,
              R.values(
                initialStateWithoutCards.structure.optionalCardSequences
              )
            )
          )
        )
      ),
      initialStateWithoutCards
    )

const initialState =
    makeMockupCards({
      currentCardIndex: 0,
      cardSequence: [ 'c76', 'c42', 'c16', 'c75', 'c12' ],
      cards: 'will be setup with mocks by enwrapping function',
      structure: {
        optionalCardSequences: {
          mustard: [ 'c90', 'c77', 'c99' ],
          plum: [ 'c65', 'c89', 'c55' ]
        },
        cards: {
          c76: {
            logic: {
              description: 'when user input is "poupon", add mustard',
              condition: {
                kind: 'userInputComparison',
                variant: 'equal',
                parameter: 'poupon',
              },
              effect: {
                kind: 'addSequence',
                parameter: 'mustard'
              }
            }
          }
        }
      }
    })

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?? compose;

const store = (matchAction => createStore(
  (state, action) => R.cond([
    [
      matchAction('UPDATE_VAL'),
      (state, action) =>
        R.converge(
          (card, value) => R.set(R.lensPath(['cards', card, 'userInput']), value, state),
          [
            R.view(R.lensPath(['payload', 'card'])),
            R.view(R.lensPath(['payload', 'value']))
          ]
        )(action)
    ],
    [
      matchAction('NAV_PREV'),
      state =>
        (lens =>
          R.set(
            lens,
            R.when(
              R.lt(0),
              R.dec
            )(
              R.view(
                lens,
                state
              )
            )
          )
        )(R.lensProp('currentCardIndex'))
        (state)
    ],
    [
      matchAction('NAV_NEXT'),
      state =>
        ((lens, maxIndex) =>
            R.set(
              lens,
              R.when(
                R.gt(maxIndex),
                R.inc
              )(
                R.view(
                  lens,
                  state
                )
              ),
              state
            )
        )(
          R.lensProp('currentCardIndex', state),
          R.compose(R.dec, R.length, R.flatten, R.prop('cardSequence'))(state)
        )
    ],
    [
      matchAction('INSERT_SEQUENCE'),
      (state, action) => {
        const {atIndex, sequence} = action.payload;

        const lensCardSequence = R.lensProp('cardSequence')
        return R.set(
          lensCardSequence,
          R.insert(atIndex, sequence, R.view(lensCardSequence, state)),
          state);
      }
    ],
    [
      matchAction('REMOVE_SEQUENCE'),
      (state, action) => {
        const {atIndex} = action.payload;

        const lensCardSequence = R.lensProp('cardSequence')

        return R.set(
          lensCardSequence,
          R.remove(atIndex, 1, R.view(lensCardSequence, state)),
          state
        )
      }
    ],
    [
      R.T, R.always(state)
    ]
  ])(state, action),
  initialState,
  composeEnhancers(
    applyMiddleware(
      logicMiddleware
    )
  )
))(
  actionToMatch => (state, action) => R.equals(actionToMatch)(R.prop('type')(action))
)

function App() {
  return (
    <div className="App" store={store}>
      <div className="Header">
        <div className="HeaderText">quelques Coupes Automatiques</div>
      </div>
      <Provider store={store}>
        <Card />
      </Provider>
    </div>
  );
}

export default App;
