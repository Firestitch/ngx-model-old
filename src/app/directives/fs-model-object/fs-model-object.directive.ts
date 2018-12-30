import { OnInit, ElementRef, Directive, Output, Input, HostBinding, Component } from '@angular/core';
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
  private _start = [0,0];

  @HostBinding('style.top.px') y1;
  @HostBinding('style.left.px') x1;

  @Output() dragStop = new EventEmitter<any>();
  @Input() object;
  @Input() scale = 1;

  @Input('x1') set _x1(value: boolean) {
    this.x1 = value;
  }

  @Input('y1') set _y1(value: boolean) {
    this.y1 = value;
  }

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
      start: (e) => {
        this._jsPlumb.setZoom(this.scale);
        this._start = e.pos;
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

    this._jsPlumb.makeSource(this.element.nativeElement, {
      filter: ".fs-model-endpoint",
      connectionType: "basicConnectionType",
    });

    this._jsPlumb.makeTarget(this.element.nativeElement, {
        allowLoopback: true,
    });
  }
}
