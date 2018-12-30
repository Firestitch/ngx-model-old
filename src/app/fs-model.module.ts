import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsModelDirective } from './directives/fs-model/fs-model.directive';
import { FsModelObjectDirective } from './directives/fs-model-object/fs-model-object.directive';
import { FsModelEndpointSourceDirective } from './directives/fs-model-endpoint-source/fs-model-endpoint-source.directive';
import { FsModelEndpointTargetDirective } from './directives/fs-model-endpoint-target/fs-model-endpoint-target.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelEndpointSourceDirective,
    FsModelEndpointTargetDirective
  ],
  entryComponents: [
  ],
  declarations: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelEndpointSourceDirective,
    FsModelEndpointTargetDirective
  ]
})
export class FsModelModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsModelModule
    };
  }
}
