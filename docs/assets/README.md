# Documentation assets

`logo.svg` is an unchanged copy of `src/assets/logo.svg`.
The fonts and their SIL Open Font License files are copied from `src/assets/fonts`.
When those project assets change, update these copies too: GitHub Pages publishes
only the `docs/` directory, so it cannot load assets from the app's source directory.

`docs.css` uses the project's palette from
`projects/ng-sq-common/src/lib/styles/_token-values.scss` and the demo layout's
white header, charcoal navigation, neutral canvas and green accents.
It is plain CSS so Docsify still needs no build step.

`docs.js` adds menu state labels, Escape dismissal, a backdrop and keyboard
isolation for the collapsed mobile sidebar, while retaining Docsify's routing.
