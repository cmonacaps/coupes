import * as R from "ramda";

// sorry this is pretty messy
// the concept is clear enough I think

export const logicMiddleware = ({ getState, dispatch }) => next => action => {
  if (action.type === 'NAV_NEXT') {
    // obvs would require factoring for reuse

    const priorState = getState();

    // set when the effect of the logic is better applied after the `action`:
    let applyPostActionEffect = null;

    const priorCard = R.nth(
      priorState.currentCardIndex,
      R.flatten(priorState.cardSequence)
    )

    const [priorCardState, priorCardStructure] =
      R.converge(
        R.pair,
        [
          R.view(R.lensPath(['cards', priorCard])),
          R.view(R.lensPath(['structure', 'cards', priorCard]))
        ]
      )(priorState)

    const {logic} = R.defaultTo({}, priorCardStructure);

    if (R.complement(R.isNil)(logic)) {
      const lensCondition = R.lensProp('condition');
      const lensKind = R.lensProp('kind')
      const lensVariant = R.lensProp('variant')
      const lensParameter = R.lensProp('parameter')

      const kind = R.view(R.compose(lensCondition, lensKind), logic);

      // this would evolve into an extended R.cond:
      if (R.equals('userInputComparison', kind)) {
        const {userInput} = priorCardState;

        const variant = R.view(R.compose(lensCondition, lensVariant), logic)
        const parameter = R.view(R.compose(lensCondition, lensParameter), logic)

        let isCondition = false;

        // might be expanded a bit
        if (R.equals('equal', variant)) {
          isCondition = R.equals(userInput, parameter)
        }

        if (R.not(isCondition)) {
          return next(action);
        }

        // example is "insert sequence on next-card" - should be applied prior
        const lensEffect = R.lensProp('effect')

        // evolves into longer R.cond:
        if (R.equals('addSequence', R.view(R.compose(lensEffect, lensKind), logic))) {
          const sequenceName = R.view(R.compose(lensEffect, lensParameter), logic)
          const sequence = R.view(
            R.lensPath(['structure', 'optionalCardSequences', sequenceName]),
            priorState);

          dispatch({
            type: 'INSERT_SEQUENCE',
            payload: {
              atIndex: R.inc(priorState.currentCardIndex),
              sequence
            }
          })
        }
      }
    }

    const result = next(action)

    // post effect here if any

    if (R.complement(R.isNil)(applyPostActionEffect)) {
    }

    return result;
  }
  else if (action.type === 'NAV_PREV') {
    // obvs would require factoring for reuse

    // in comparison to NAV_NEXT written above, the example logic effect
    // is better applied after the `action`, but similarly there might
    // be a different logic and effect to apply before NAV_PREV

    const priorState = getState();

    const priorCard = R.nth(
      priorState.currentCardIndex,
      R.flatten(priorState.cardSequence)
    )

    const [priorCardState, priorCardStructure] =
      R.converge(
        R.pair,
        [
          R.view(R.lensPath(['cards', priorCard])),
          R.view(R.lensPath(['structure', 'cards', priorCard]))
        ]
      )(priorState)

    const result = next(action)

    const postState = getState();

    const postCard = R.nth(
      postState.currentCardIndex,
      R.flatten(postState.cardSequence)
    )

    const [postCardState, postCardStructure] =
      R.converge(
        R.pair,
        [
          R.view(R.lensPath(['cards', postCard])),
          R.view(R.lensPath(['structure', 'cards', postCard]))
        ]
      )(postState)

    // might need 2 of these post and prior
    // perhaps some on-previous logic could be stated more clearly on the prior card
    const {logic} = R.defaultTo({}, postCardStructure);

    if (R.complement(R.isNil)(logic)) {
      const lensCondition = R.lensProp('condition');
      const lensKind = R.lensProp('kind')
      const lensVariant = R.lensProp('variant')
      const lensParameter = R.lensProp('parameter')

      const kind = R.view(R.compose(lensCondition, lensKind), logic);

      // this would evolve into an extended R.cond:
      if (R.equals('userInputComparison', kind)) {
        const {userInput} = postCardState;

        const variant = R.view(R.compose(lensCondition, lensVariant), logic)
        const parameter = R.view(R.compose(lensCondition, lensParameter), logic)

        let isCondition = false;

        // might be expanded a bit
        if (R.equals('equal', variant)) {
          isCondition = R.equals(userInput, parameter)
        }

        if (R.not(isCondition)) {
          return result;
        }

        // example is "insert sequence on next-card" - should be undone post
        const lensEffect = R.lensProp('effect')

        // evolves into longer R.cond:
        if (R.equals('addSequence', R.view(R.compose(lensEffect, lensKind), logic))) {
          dispatch({
            type: 'REMOVE_SEQUENCE',
            payload: {
              atIndex: priorState.currentCardIndex,
            }
          })
        }
      }
    }

    return result;
  }

  return next(action);
};