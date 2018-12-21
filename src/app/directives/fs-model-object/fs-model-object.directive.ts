import { OnInit, ElementRef, Directive, Output, Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FsModelDirective } from '../fs-model/fs-model.directive';


@Directive({
  selector: '[fsModelObject]',
  'host': {
    class: 'fs-model-object'
  }
})
export class FsModelObjectDirective implements OnInit {

  private _jsPlumb: any;
  private _fsModelDirective: FsModelDirective;

  @Output() dragStop = new EventEmitter<any>();
  @Input() id;

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

    this._jsPlumb.draggable([this.element.nativeElement],
    {
      containment: 'parent',
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

        this.dragStop.emit({ directive: this, x1: x1, y1: y1 });
      }
    });
  }
}
