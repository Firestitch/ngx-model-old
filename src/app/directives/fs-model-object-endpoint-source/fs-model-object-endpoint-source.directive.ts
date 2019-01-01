import { Directive, ElementRef } from '@angular/core';
import { FsModelObjectDirective } from '../fs-model-object';


@Directive({
  selector: '[fsModelObjectEndpointSource]',
  host: {
    class: 'fs-model-object-endpoint-source'
  }
})
export class FsModelObjectEndpointSourceDirective {
}
