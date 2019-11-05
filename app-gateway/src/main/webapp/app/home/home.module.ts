import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AadeSharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxBootstrapMultiselectDropdownModule } from 'ngx-bootstrap-multiselect-dropdown';
import { TagInputModule } from 'ngx-chips';
import { ChartjsModule } from '@ctrl/ngx-chartjs';

@NgModule({
  imports: [
    AadeSharedModule,
    RouterModule.forChild([HOME_ROUTE]),
    NgxChartsModule,
    NgxBootstrapMultiselectDropdownModule,
    TagInputModule,
    ChartjsModule
  ],
  declarations: [HomeComponent]
})
export class AadeHomeModule {}
