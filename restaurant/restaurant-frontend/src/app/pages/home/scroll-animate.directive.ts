import { Directive, ElementRef, Renderer2, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[appScrollAnimate]'
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
    @Input('appScrollAnimate') animateClass = 'scroll-fade-in';
    private observer!: IntersectionObserver;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit() {
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.renderer.addClass(this.el.nativeElement, this.animateClass);
                    this.observer.disconnect();
                }
            });
        }, { threshold: 0.15 });
        this.observer.observe(this.el.nativeElement);
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
} 