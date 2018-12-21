import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsModelDirective } from './directives/fs-model/fs-model.directive';
import { FsModelObjectDirective } from './directives/fs-model-object/fs-model-object.directive';
// import { FsComponentService } from './services';

@NgModule({
  imports: [
    CommonModule,
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
  ],
  providers: [
    // FsComponentService,
  ],
})
export class FsComponentModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsComponentModule,
      // providers: [FsComponentService]
    };
  }
}
