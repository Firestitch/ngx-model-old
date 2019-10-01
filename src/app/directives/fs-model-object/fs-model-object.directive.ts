import {

  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  OnDestroy
} from '@angular/core';
import { uniq } from 'lodash-es';
import { FsModelDirective } from '../fs-model/fs-model.directive';


@Directive({
  selector: '[fsModelObject]',
  'host': {
    class: 'fs-model-object'
  }
})
export class FsModelObjectDirective implements OnDestroy {

  private _jsPlumb: any;
  private _mouseDownEvent: any;
  private _mouseUpEvent: any;

  @Input() maxTargetConnections = 0;
  @Input() maxSourceConnections = 0;
  @Input() selfTargetable = true;

  @HostBinding('style.top.px') y1: number;
  @HostBinding('style.left.px') x1: number;
  @Input() @HostBinding('class.draggable') draggable = true;

  @HostListener('click', ['$event'])
  onClick(e) {
    const xDelta = Math.abs(this._mouseDownEvent.screenX - this._mouseUpEvent.screenX);
    const yDelta = Math.abs(this._mouseDownEvent.screenY - this._mouseUpEvent.screenY);

    if (xDelta > 1 || yDelta > 1) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e) {
    this._mouseDownEvent = e;
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(e) {
    this._mouseUpEvent = e;
  }

  @Output() dragStop = new EventEmitter<any>();
  @Output() dragStart = new EventEmitter<any>();
  @Input() data;
  @Input() scale = 1;

  @Input('x1') set _x1(value: number) {
    this.x1 = value;
  }

  @Input('y1') set _y1(value: number) {
    this.y1 = value;
  }

  private _modelDirective: FsModelDirective;

  constructor(private _element: ElementRef) {}

  get element(): ElementRef {
    return this._element;
  }

  init(jsPlumb, modelDirective: FsModelDirective) {

    if (this._jsPlumb) {
      return;
    }

    this._modelDirective = modelDirective;
    this.element.nativeElement.fsModelObjectDirective = this;
    this._jsPlumb = jsPlumb;

    if (this.draggable) {
      this._jsPlumb.draggable([this.element.nativeElement],
        {
          start: (e) => {
            this.dragStart.emit(e);
            this._jsPlumb.setZoom(this.scale);
          },
          stop: e => {
            const x1 = e.pos[0];
            const y1 = e.pos[1];
            this.dragStop.emit({ event: e, data: this.data, x1: x1, y1: y1 });
          }
        });
    }

    this._jsPlumb.makeSource(this.element.nativeElement, {
      filter: '.fs-model-endpoint'
    });

    // Check if the directive fsModelTarget is set and if so make it targetable
    if (this.element.nativeElement.getAttribute('fsmodeltarget') !== null) {
      this._jsPlumb.makeTarget(this.element.nativeElement, {
        allowLoopback: this.selfTargetable
      });

      this._jsPlumb.bind('connection', (info: any, e: Event) => {

        if (e) {

          if (info.target === this.element.nativeElement) {

            if (this.maxTargetConnections) {
              const connections = this._jsPlumb.getConnections({
                target: info.target
              });

              if (this.maxTargetConnections < connections.length) {
                setTimeout(() => {
                  this._jsPlumb.deleteConnection(info.connection);
                });
                e.preventDefault();
              }
            }

            if (this.maxSourceConnections) {
              const connections = this._jsPlumb.getConnections({
                source: info.source
              });

              if (this.maxSourceConnections < connections.length) {
                setTimeout(() => {
                  this._jsPlumb.deleteConnection(info.connection);
                });
                e.preventDefault();
              }
            }
          }
        }
      }, true);
    }
  }

  public repaint() {
    this._jsPlumb.revalidate(this.element.nativeElement);
  }

  public ngOnDestroy() {

    uniq(this._modelDirective.getConnections({
      target: this.data
    }).concat(this._modelDirective.getConnections({
      source: this.data
    })))
    .forEach(conn => {
      this._modelDirective.disconnect(conn);
    });

    this._jsPlumb.unmakeTarget(this.element.nativeElement);
  }
}
