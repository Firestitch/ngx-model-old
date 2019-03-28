import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsModelDirective } from './directives/fs-model/fs-model.directive';
import { FsModelObjectDirective } from './directives/fs-model-object/fs-model-object.directive';
import { FsModelEndpointDirective } from './directives/fs-model-endpoint/fs-model-endpoint.directive';
import { FsModelTargetDirective } from './directives/fs-model-target/fs-model-target.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelEndpointDirective,
    FsModelTargetDirective
  ],
  exports: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelEndpointDirective,
    FsModelTargetDirective
  ]
})
export class FsModelModule {

}
