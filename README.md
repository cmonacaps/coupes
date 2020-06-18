# coupes

## some automatic cuts

Suppose you're describing some cards in JSON.

These could be standard playing cards, for example:

```JSON
{
  "rank": "J",
  "suit": "♣︎︎"
}
```

Tarot:

```JSON
[
    {
      "arcanaMajor": "The Hermit"
    },
    {
      "arcanaMinor": { "rank": "Page", "suit": "Batons" }
    }
]
```

Recipes, as if they were held in a set of index cards:

```JSON
{
  "name": "Pemmican",
  "ingredients": [ "game meat", "chokeberry", "tallow" ],
  "instructions": [
    "cut the game meat into small pieces",
    "dry the game meat and chokeberry completely and pulverize",
    "mix the powdered game meat and chokeberry into the tallow",
    "press the resulting putty into a container and store at room temperature 1 to 5 years"
  ]
}
```

And so on. The content of the cards is not important.

These cards could be arranged into sequences, for example, on a gaming table:

```JSON
{
  "current": c76,
  "house": [ c76, c42, c16, c75, c12 ],
  "players": {
    "mustard": [ c90, c16, c99 ],
    "plum": [ c65, c89, c55 ]
  } 
}
```

In this game, the `house` may `trick` a player, which means
that the `house` takes the player's cards into their own
sequence.

The game proceeds by sequential consideration of the `house`'s cards,
and some of the cards themselves might be associated with a `plan`, that
indicates under what conditions what `tricks`, if any, might occur.

For example, letting `basicCard` refer to any of the card examples
presented above, we might write the card in JSON as
```JSON
{
   ...basicCard,
   plan
}
```
where the `plan` may be undefined. For example, the `plan` associated
with card `c42` in the `house` sequence might be that the `house` will
`trick` `plum` if the current card has the same suit as the previous:
```JSON
{
  ...c42Content,
  "plan": {
    "kind": "trick",
    "party": "house",
    "counterparty": "plum",
    "condition": {
      "kind": "equal",
      "parameters": [
        { "kind": "suit", "value": "this" },
        { "kind": "suit", "value": "previous" } ]
      }
    }
  }
}
```

If the stated condition were true, following this card the table would be:

```JSON
{
  "current": c65,
  "house": [ c76, c42, [ c65, c89, c55 ], c16, c75, c12 ],
  "players": {
    "mustard": [ c90, c16, c99 ],
    "plum": [ c65, c89, c55 ]
  } 
}
```

If the table were described as such following a `trick`, some game mechanics
might be more readily implemented by first flattening the `house` sequence:

```js
  const nextCard = 
    (sequence =>
      sequence[ R.inc( R.indexOf(c65, sequence) ) ]
    )(R.flatten(table.house));
```

## Backward play

A player may reverse the order of sequential consideration of cards.

In the case that a `trick` was made when playing forward, that `trick`
must be undone when playing backward. For that reason, it might be best
to avoid flattening the `house` sequence in the `table` representation.

```js
  const previousCard = card =>
    (sequence =>
      sequence[ R.dec( R.indexOf(thisCard, sequence) ) ]
    )(R.flatten(table.house)

  const beginsATrick = card =>
    R.includes(
      card,
      R.map(
        R.head,
        R.filter(
          R.pipe(R.type, R.equals('Array')),
          table.house
        )
      )
    )

  const removeNext =
    R.compose(
      R.remove,
      R.inc,
      R.flip(R.indexOf)(table.house)
    )

  const previousCardAndUntrick =
    R.when(
      beginsATrick,
      removeNext,
      previousCard
    )
```

## Alternate tricks

A `plan` could describe a `trick` of different parties under different
conditions.

For example, if the `condition` passes, the `house` tricks `plum`,
and the `house` tricks `mustard` otherwise:

```JSON
{
  ...c42Content,
  "plan": {
    "kind": "counterpartySelectTrick",
    "party": "house",
    "counterparty": [ "plum", "mustard" ],
    "condition": {
      "kind": "equal",
      "parameters": [
        { "kind": "suit", "value": "this" },
        { "kind": "suit", "value": "previous" } ]
      }
    }
  }
}
```
