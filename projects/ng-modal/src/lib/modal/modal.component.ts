import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  model,
  signal,
  effect,
} from "@angular/core";
import { OutsideClickListenerDirective } from "@sq-ui/ng-sq-common";

export interface ModalCssAnimation {
  duration: number;
  entranceAnimation: string;
  exitAnimation: string;
}

const DEFAULT_ENTRANCE_ANIMATION = "fadeInDown";
const DEFAULT_EXIT_ANIMATION = "fadeOutUp";
const DEFAULT_ANIMATION_DURATION = 500;

@Component({
  selector: "sq-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [OutsideClickListenerDirective],
})
export class ModalComponent {
  readonly show = model(false);
  readonly customCssAnimation = input<ModalCssAnimation>({
    duration: 0,
    entranceAnimation: "",
    exitAnimation: "",
  });

  readonly isHidden = signal(true);
  readonly animationClass = signal("");
  readonly listenForOutsideClick = signal(false);

  private isFirstRun = true;
  private entranceTimeout?: ReturnType<typeof setTimeout>;
  private exitTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const shouldShow = this.show();

      // Skip animating on the initial run so the modal simply renders in its starting state.
      if (this.isFirstRun) {
        this.isFirstRun = false;
        this.isHidden.set(!shouldShow);
        return;
      }

      if (shouldShow) {
        this.playEntranceAnimation();
      } else {
        this.playExitAnimation();
      }
    });
  }

  close(): void {
    this.show.set(false);
  }

  open(): void {
    this.show.set(true);
  }

  onClickOutsideComponent(): void {
    this.listenForOutsideClick.set(false);
    this.close();
  }

  private playEntranceAnimation(): void {
    const { entranceAnimation, duration } = this.customCssAnimation();
    const animationClass = entranceAnimation || DEFAULT_ENTRANCE_ANIMATION;
    const animationDuration = duration || DEFAULT_ANIMATION_DURATION;

    clearTimeout(this.exitTimeout);
    this.isHidden.set(false);
    this.animationClass.set(animationClass);

    this.entranceTimeout = setTimeout(() => {
      this.animationClass.set("");
      this.listenForOutsideClick.set(true);
    }, animationDuration);
  }

  private playExitAnimation(): void {
    const { exitAnimation, duration } = this.customCssAnimation();
    const animationClass = exitAnimation || DEFAULT_EXIT_ANIMATION;
    const animationDuration = duration || DEFAULT_ANIMATION_DURATION;

    clearTimeout(this.entranceTimeout);
    this.listenForOutsideClick.set(false);
    this.animationClass.set(animationClass);

    this.exitTimeout = setTimeout(() => {
      this.isHidden.set(true);
      this.animationClass.set("");
    }, animationDuration);
  }
}
