import { Directive } from '@angular/core';


@Directive({
  selector: '[fsModelEndpoint]',
  'host': {
    class: 'fs-model-endpoint'
  }
})
export class FsModelEndpointDirective {

}
