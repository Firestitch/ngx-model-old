import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsModelDirective } from './directives/fs-model/fs-model.directive';
import { FsModelObjectDirective } from './directives/fs-model-object/fs-model-object.directive';
import { FsModelEndpointDirective } from './directives/fs-model-endpoint/fs-model-endpoint.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelEndpointDirective,
  ],
  entryComponents: [],
  declarations: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelEndpointDirective,
  ]
})
export class FsModelModule {
  /*static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsModelModule
    };
  }*/
}
