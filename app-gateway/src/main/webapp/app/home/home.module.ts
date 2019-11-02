import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AadeSharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxBootstrapMultiselectDropdownModule } from 'ngx-bootstrap-multiselect-dropdown';

@NgModule({
  imports: [AadeSharedModule, RouterModule.forChild([HOME_ROUTE]), NgxChartsModule, NgxBootstrapMultiselectDropdownModule],
  declarations: [HomeComponent]
})
export class AadeHomeModule {}
