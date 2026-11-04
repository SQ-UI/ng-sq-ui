import { ChangeDetectionStrategy, Component } from '@angular/core';

const headingSizes = [
  { size: 'xxl', fontSize: 48, lineHeight: 64 },
  { size: 'xl', fontSize: 40, lineHeight: 56 },
  { size: 'l', fontSize: 32, lineHeight: 48 },
  { size: 'm', fontSize: 24, lineHeight: 40 },
  { size: 's', fontSize: 20, lineHeight: 32 },
  { size: 'xs', fontSize: 16, lineHeight: 28 },
  { size: 'xxs', fontSize: 12, lineHeight: 20 },
];
const textSizes = [
  { size: 'xxl', fontSize: 32, lineHeight: 48 },
  { size: 'xl', fontSize: 24, lineHeight: 40 },
  { size: 'l', fontSize: 20, lineHeight: 32 },
];

@Component({
  selector: 'sq-typography-preview',
  standalone: true,
  templateUrl: './typography-preview.component.html',
  styleUrls: ['./typography-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyPreviewComponent {
  readonly groups = [
    { name: 'Header 1', family: 'Institut · Regular', prefix: 'sq-h1', sample: 'H1 Aa', display: true, sizes: [
      { size: 'xxl', fontSize: 80, lineHeight: 96 },
      { size: 'xl', fontSize: 64, lineHeight: 80 },
      { size: 'l', fontSize: 48, lineHeight: 64 },
      { size: 'm', fontSize: 40, lineHeight: 56 },
      { size: 's', fontSize: 32, lineHeight: 48 },
      { size: 'xs', fontSize: 24, lineHeight: 40 },
      { size: 'xxs', fontSize: 20, lineHeight: 32 },
    ] },
    { name: 'Header 2', family: 'Space Grotesk · Bold', prefix: 'sq-h2', sample: 'H2 Aa', display: false, sizes: headingSizes },
    { name: 'Header 3', family: 'Space Mono · Bold', prefix: 'sq-h3', sample: 'H3 Aa', display: false, sizes: headingSizes },
    { name: 'Text 1', family: 'Space Grotesk · Regular', prefix: 'sq-text1', sample: 'Text 1', display: false, sizes: textSizes },
    { name: 'Text 2', family: 'Space Mono · Regular', prefix: 'sq-text2', sample: 'Text 2', display: false, sizes: textSizes },
    { name: 'Button text', family: 'Space Grotesk · Semibold', prefix: 'sq-button-text', sample: 'Button', display: false, sizes: textSizes },
  ];
}
