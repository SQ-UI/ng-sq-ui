# Demo fonts

The demo self-hosts unmodified font files from the official Google Fonts repository:

- Space Grotesk variable (weight range 300–700): https://github.com/google/fonts/tree/main/ofl/spacegrotesk
- Space Mono Regular (400) and Bold (700): https://github.com/google/fonts/tree/main/ofl/spacemono

Each family directory includes its SIL Open Font License. Font binaries retain their original contents; the Grotesk variable file is named `SpaceGrotesk-Variable.ttf` locally. The reusable component packages do not bundle these demo assets.

The H1 screenshot labels its face “Insitut”; the matching candidate is Brownfox's Institut Regular. Its official evaluation font was downloaded to the ignored `tmp/fonts/institut-trial.otf` at the user's request. Trial files are kept outside public demo/package assets. A licensed Institut webfont can be loaded as `font-family: 'Institut'`; the existing H1 stack will then use it. Until then, H1 uses its declared Space Grotesk fallback.

Institut information: https://brownfox.org/fonts/institut

Trial conditions: https://brownfox-type.ru/faq
