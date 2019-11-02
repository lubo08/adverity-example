import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import './vendor';
import { AadeSharedModule } from 'app/shared/shared.module';
import { AadeCoreModule } from 'app/core/core.module';
import { AadeAppRoutingModule } from './app-routing.module';
import { AadeHomeModule } from './home/home.module';
import { AadeEntityModule } from './entities/entity.module';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { JhiMainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
import { ErrorComponent } from './layouts/error/error.component';

@NgModule({
  imports: [
    BrowserModule,
    AadeSharedModule,
    AadeCoreModule,
    AadeHomeModule,
    // jhipster-needle-angular-add-module JHipster will add new module here
    AadeEntityModule,
    AadeAppRoutingModule
  ],
  declarations: [JhiMainComponent, NavbarComponent, ErrorComponent, PageRibbonComponent, ActiveMenuDirective, FooterComponent],
  bootstrap: [JhiMainComponent]
})
export class AadeAppModule {}
