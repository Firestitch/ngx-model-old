import { Directive, ElementRef } from '@angular/core';
import { DefaultConnectionType } from '../../helpers/consts';
import { FsModelObjectDirective } from '../fs-model-object';


@Directive({
  selector: '[fsModelEndpointSource]',
  'host': {
    class: 'fs-model-endpoint-source'
  }
})
export class FsModelEndpointSourceDirective {

  // private _jsPlumb;
  // private _fsModelObjectDirective: FsModelObjectDirective;

  // constructor(private _element: ElementRef) {}

  // get element(): ElementRef {
  //   return this._element;
  // }

  // init(jsPlumb, fsModelObjectDirective: FsModelObjectDirective) {

  //   if(this._jsPlumb) {
  //     return;
  //   }

  //   this._jsPlumb = jsPlumb;
  //   this._fsModelObjectDirective = fsModelObjectDirective;
  // }
}
