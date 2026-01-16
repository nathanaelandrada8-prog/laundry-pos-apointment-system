import { Directive, ElementRef, OnDestroy, OnInit, Renderer2, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[ngModel][name]',
  standalone: true
})
export class AutoValidateDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private control = inject(NgControl);
  private renderer = inject(Renderer2);

  private statusSub!: Subscription;
  private errorElement: HTMLElement | null = null;

  @HostListener('blur') onBlur() {
    this.updateErrorMessage();
  }

  ngOnInit() {
    // Listen for status changes (like when they finally type something)
    this.statusSub = this.control.statusChanges!.subscribe(() => {
      this.updateErrorMessage();
    });
  }

  // We make this public so we can call it from the component if needed
  public updateErrorMessage() {
      requestAnimationFrame(() => {
      const isRadio = this.el.nativeElement.type === 'radio';

      // For standard inputs, show error as usual
      // For radios, we skip the 'p' tag injection to avoid duplicates in the grid
      if (!isRadio && this.control.invalid && (this.control.touched || this.control.dirty)) {
        this.showError();
      } else {
        this.removeError();
      }
    });
  }

  private showError() {
    if (this.errorElement) return;

    this.errorElement = this.renderer.createElement('p');
    this.renderer.addClass(this.errorElement, 'auto-error-msg');

    // Check which error exists
    const message = this.control.errors?.['required']
      ? 'This field is required'
      : 'Invalid input';

    const text = this.renderer.createText(message);
    this.renderer.appendChild(this.errorElement, text);

    // Logic to find the right parent (important for your radio buttons)
    const parent = this.el.nativeElement.closest('.form-group') || this.el.nativeElement.parentNode;
    if (parent) {
      this.renderer.appendChild(parent, this.errorElement);
    }
  }

  private removeError() {
    if (this.errorElement) {
      const parent = this.errorElement.parentNode;
      if (parent) {
        this.renderer.removeChild(parent, this.errorElement);
      }
      this.errorElement = null;
    }
  }

  ngOnDestroy() {
    this.statusSub?.unsubscribe();
    this.removeError();
  }
}
