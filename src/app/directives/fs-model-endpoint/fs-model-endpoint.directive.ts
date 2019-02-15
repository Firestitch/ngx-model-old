import { Directive, Input, HostBinding, OnInit } from '@angular/core';


@Directive({
  selector: '[fsModelEndpoint]'
})
export class FsModelEndpointDirective implements OnInit {

  @Input() placement;

  @HostBinding('class') class: string;

  ngOnInit() {
    this.class = 'fs-model-endpoint ' + this.placement;
  }

}
