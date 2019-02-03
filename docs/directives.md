# Directives

!> If you use [@sq-ui/ng-sq-ui](https://www.npmjs.com/package/@sq-ui/ng-sq-ui) package all directives should be available to you

!> Available directives in [@sq-ui/ng-sq-common](https://www.npmjs.com/package/@sq-ui/ng-sq-common) package

## OutsideClickListenerDirective

?> Use to track clicks outside of an element.

```html
<div #sqExample
    sqOutsideClickListener
    [listenForOutsideClick]="listenForOutsideClick"
    (clickOutside)="onClickOutsideComponent()">
</div>
```

```typescript
import { AfterViewInit } from '@angular/core';

export class ExampleComponent implements AfterViewInit {

    listenForOutsideClick: boolean = false;
    
    ngAfterViewInit() {
        listenForOutsideClick = true;
    }

    onClickOutsideComponent() {
        this.listenForOutsideClick = false;
        // your code here
    }
}
```
