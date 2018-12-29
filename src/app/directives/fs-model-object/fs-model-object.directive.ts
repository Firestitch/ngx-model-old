import { OnInit, ElementRef, Directive, Output, Input, HostBinding, Component } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FsModelDirective } from '../fs-model/fs-model.directive';


@Component({
  selector: '[fsModelObject]',
  'host': {
    class: ''
  },
  template: '<div class="fs-model-object" [style.top.px]="y1" [style.left.px]="x1"><ng-content></ng-content></div>'
})
export class FsModelObjectDirective implements OnInit {

  private _jsPlumb: any;
  private _fsModelDirective: FsModelDirective;
  private _start = [0,0];

  @Output() dragStop = new EventEmitter<any>();
  @Input() object;
  @Input() scale = 1;
  @Input() x1;
  @Input() y1;

  constructor(private _element: ElementRef) {}

  ngOnInit() {
  }

  get element(): ElementRef {
    return this._element;
  }

  init(jsPlumb, fsModelDirective: FsModelDirective) {

    if(this._jsPlumb) {
      return;
    }

    this._jsPlumb = jsPlumb;
    this._fsModelDirective = fsModelDirective;

    const instance = this._jsPlumb.draggable([this.element.nativeElement.firstChild],
    {
      start: (e) => {
        instance.setZoom(this.scale);
        this._start = e.pos;
      },
      drag: (e) => {

        let dx = e.pos[0] - this._start[0];
        let dy = e.pos[1] - this._start[1];

        dx /= this.scale;
        dy /= this.scale;

        //e.drag.moveBy(dx, dy, e.e);
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

        this.dragStop.emit({ object: this.object, x1: x1, y1: y1 });
      }
    });
  }
}
