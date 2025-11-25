import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLoadingSpinner]',
  standalone: true
})
export class LoadingSpinnerDirective implements OnChanges {
  @Input() appLoadingSpinner: boolean = false;
  private spinnerElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    if (this.appLoadingSpinner) {
      this.showSpinner();
    } else {
      this.hideSpinner();
    }
  }

  private showSpinner() {
    if (!this.spinnerElement) {
      this.spinnerElement = this.renderer.createElement('div');
      this.renderer.addClass(this.spinnerElement, 'loading-overlay');
      
      const spinner = this.renderer.createElement('div');
      this.renderer.addClass(spinner, 'spinner');
      
      this.renderer.appendChild(this.spinnerElement, spinner);
      this.renderer.appendChild(this.el.nativeElement, this.spinnerElement);
      
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    }
  }

  private hideSpinner() {
    if (this.spinnerElement) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerElement);
      this.spinnerElement = null;
    }
  }
}