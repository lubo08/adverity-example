import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { LoginModalService } from 'app/core/login/login-modal.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account;
  authSubscription: Subscription;
  modalRef: NgbModalRef;

  single: any[];
  multi: any[] = [
    {
      name: 'Cyan',
      series: [
        {
          name: 5,
          value: 2650
        },
        {
          name: 10,
          value: 2800
        },
        {
          name: 15,
          value: 2000
        }
      ]
    },
    {
      name: 'Yellow',
      series: [
        {
          name: 5,
          value: 2500
        },
        {
          name: 10,
          value: 3100
        },
        {
          name: 15,
          value: 2350
        }
      ]
    }
  ];

  view: any[] = [700, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Date';
  showYAxisLabel = true;
  yAxisLabel = 'Impresions, Clicks';
  timeline = true;
  yAxis: [
    {
      type: 'linear';
      labels: {
        format: '{value} (c)';
      };
      title: {
        text: 'Clicks';
      };
    },
    {
      type: 'linear';
      labels: {
        format: '{value} (i)';
      };
      title: {
        text: 'Impresions';
      };
    }
  ];

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = true;
  dropdownList = [];

  // model
  selectedItems = [];
  dropdownList2 = [];

  // model
  selectedItems2 = [];

  // Example settings
  dropdownSettings = {
    dataIdProperty: 'idValue',
    dataNameProperty: 'nameValue',
    headerText: 'Test header',
    noneSelectedBtnText: 'All selected',
    btnWidth: 'auto',
    dropdownHeight: 'auto',
    showDeselectAllBtn: true,
    showSelectAllBtn: true,
    deselectAllBtnText: 'Deselect',
    selectAllBtnText: 'Select',
    btnClasses: 'btn btn-primary btn-sm dropdown-toggle',
    selectionLimit: 3,
    enableFilter: true
  };

  constructor(
    private accountService: AccountService,
    private loginModalService: LoginModalService,
    private eventManager: JhiEventManager,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.loagData();
    });
    this.registerAuthenticationSuccess();
  }

  onSelect(event) {
    // console.log(event);
  }

  registerAuthenticationSuccess() {
    this.authSubscription = this.eventManager.subscribe('authenticationSuccess', message => {
      this.accountService.identity().subscribe(account => {
        this.account = account;
      });
    });
  }

  loagData() {
    this.http
      .get<any[]>(`/api/_search/campaigns`)
      .pipe(first())
      .subscribe(response => {
        response.forEach(source => {
          this.dropdownList2.push({ idValue: source, nameValue: source });
        });
      });
    this.http
      .get<any[]>(`/api/_search/datasources`)
      .pipe(first())
      .subscribe(response => {
        response.forEach(source => {
          this.dropdownList.push({ idValue: source, nameValue: source });
        });
      });
    this.http
      .get<any[]>(`/api/_search/datagram`)
      .pipe(first())
      .subscribe(response => {
        this.multi = [];
        const clicks = [];
        const impresions = [];
        response.forEach(day => {
          // console.log(day);
          const lineDate = new Date(day.day);
          clicks.push({
            name: lineDate.toLocaleDateString(),
            yAxis: 0,
            value: day.clicks
          });
          impresions.push({
            name: lineDate.toLocaleDateString(),
            yAxis: 1,
            value: day.impresions
          });
        });
        this.multi.push({
          name: 'Clicks',
          series: clicks
        });
        this.multi.push({
          name: 'Impresions',
          series: impresions
        });
        // console.log(response);
      });
  }

  isAuthenticated() {
    return this.accountService.isAuthenticated();
  }

  login() {
    this.modalRef = this.loginModalService.open();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.eventManager.destroy(this.authSubscription);
    }
  }
}
