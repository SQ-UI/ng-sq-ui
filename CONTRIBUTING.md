## How to contribute to NG-SQ-UI

Welcome to create [pull requests](https://github.com/SQ-UI/ng-sq-ui/compare) for bugfix, new component, doc, example, suggestion and anything.

## Branch Management

```
master
 ↑
dev         <--- Develop/PR
```

- `dev` branch
  - `dev` is the developing branch.
  - It's **RECOMMENDED** to commit feature PR to `dev`.
- `master` branch
  - `master` is the release branch,we will make tag and publish version on this branch.

## Commit Log

```
[{action}] {description}
```

- `{action}`
  - `+` add
  - `!` update or bugfix
  - `-` remove
- `{description}`
  - Just make it as clear and simple as possible.

for example:

- [+] Support for IPhoneX.
- [!] The code format follows ESlint.

## Testing

- `npm test` runs the whole suite with Vitest (jsdom, zoneless Angular testing) — it must terminate
  in well under a minute.
- `npm run coverage` writes `coverage/lcov.info`, which CI uploads to CodeClimate.
- **If a run appears to hang**, delete the Vite dependency-optimizer cache (`rm -rf node_modules/.vite`)
  and retry. Never stop a run with `kill -9` while Vite is optimizing dependencies: it leaves the cache
  in a state where every later run waits forever (see `VITEST_4_MIGRATION_PLAN.md` §0).

## More

It is a good habit to create a feature request issue to disscuss whether the feature is necessary before you implement it. However, it's unnecessary to create an issue to claim that you found a typo or improved the readability of documentaion, just create a pull request.
