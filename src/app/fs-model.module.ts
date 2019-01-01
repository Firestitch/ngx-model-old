import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsModelDirective } from './directives/fs-model/fs-model.directive';
import { FsModelObjectDirective } from './directives/fs-model-object/fs-model-object.directive';
import { FsModelObjectEndpointSourceDirective } from './directives/fs-model-endpoint-source/fs-model-object-endpoint-source.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelObjectEndpointSourceDirective
  ],
  entryComponents: [
  ],
  declarations: [
    FsModelDirective,
    FsModelObjectDirective,
    FsModelObjectEndpointSourceDirective
  ]
})
export class FsModelModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsModelModule
    };
  }
}
