# Directives

## @sq-ui/ng-sq-ui

> If you use this package all directives should be available to you

## @sq-ui/ng-sq-common

> Available directives in this package

### OutsideClickListenerDirective

?> Use to track outside clicks of element. Usefull when you need to track when to close something.

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