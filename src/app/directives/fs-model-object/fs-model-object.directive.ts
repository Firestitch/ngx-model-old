import { ElementRef, Directive, Output, Input, HostBinding } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FsModelDirective } from '../fs-model/fs-model.directive';


@Directive({
  selector: '[fsModelObject]',
  'host': {
    class: 'fs-model-object'
  }
})
export class FsModelObjectDirective {

  private _jsPlumb: any;
  private _fsModelDirective: FsModelDirective;

  @HostBinding('style.top.px') y1: number;
  @HostBinding('style.left.px') x1: number;

  @Output() dragStop = new EventEmitter<any>();
  @Input() data;
  @Input() scale = 1;

  @Input('x1') set _x1(value: number) {
    this.x1 = value;
  }

  @Input('y1') set _y1(value: number) {
    this.y1 = value;
  }

  constructor(private _element: ElementRef) {}

  get element(): ElementRef {
    return this._element;
  }

  init(jsPlumb, fsModelDirective: FsModelDirective) {

    if(this._jsPlumb) {
      return;
    }

    this._fsModelDirective = fsModelDirective;
    this._jsPlumb = jsPlumb;
    this._jsPlumb.draggable([this.element.nativeElement],
    {
      start: (e) => {
        this._jsPlumb.setZoom(this.scale);
      },
      stop: event => {

        const canvas = this._fsModelDirective.element.nativeElement;
        const left = 0;
        const top = 0;
        const right = canvas.offsetWidth;
        const bottom  = canvas.offsetHeight;
        const height = event.el.offsetHeight;

        let x1 = event.pos[0];
        let y1 = event.pos[1];

        if (x1 < left) {
          x1 = left;
        }

        if ((x1 + height) > right) {
          x1 = right - height;
        }

        if (y1 < top) {
          y1 = top;
        }

        if ((y1 + height) > bottom) {
          y1 = bottom - height;
        }

        this.dragStop.emit({ data: this.data, x1: x1, y1: y1 });
      }
    });

    this._jsPlumb.makeSource(this.element.nativeElement, {
      filter: '.fs-model-object-endpoint-source'
    });

    this._jsPlumb.makeTarget(this.element.nativeElement, {
      allowLoopback: true
    });
  }
}
