import { Directive } from '@angular/core';


@Directive({
  selector: '[fsModelEndpointTarget]',
  'host': {
    class: 'fs-model-endpoint-target'
  }
})
export class FsModelEndpointTargetDirective {

}
