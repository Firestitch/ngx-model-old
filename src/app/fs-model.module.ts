import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsModelDirective } from './directives/fs-model/fs-model.directive';
import { FsModelObjectDirective } from './directives/fs-model-object/fs-model-object.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FsModelDirective,
    FsModelObjectDirective
  ],
  entryComponents: [
  ],
  declarations: [
    FsModelDirective,
    FsModelObjectDirective
  ]
})
export class FsModelModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsModelModule
    };
  }
}
