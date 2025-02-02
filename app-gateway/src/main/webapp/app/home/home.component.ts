import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { LoginModalService } from 'app/core/login/login-modal.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { HttpClient } from '@angular/common/http';
import { first, map } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';

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

  myDataSets = [
    {
      name: 'likes',
      points: [{ x: 10, y: 100 }, { x: 20, y: 500 }]
    }
  ];

  // line, area
  autoScale = true;
  dropdownList = [];

  // model
  selectedItems = [];
  dropdownList2 = [];

  // model
  selectedItems2 = [];
  autocompleteDatasources = [];
  modelDatasources;

  autocompleteCampaigns = [];
  modelCampaigns;

  data = {
    labels: [],
    datasets: [
      {
        label: 'Clicks',
        borderColor: 'red',
        backgroundColor: 'red',
        fill: false,
        data: [],
        yAxisID: 'y-axis-1'
      },
      {
        label: 'Impresions',
        borderColor: 'blue',
        backgroundColor: 'blue',
        fill: false,
        data: [],
        yAxisID: 'y-axis-2'
      }
    ]
  };

  options = {
    responsive: true,
    hoverMode: 'index',
    stacked: false,
    title: {
      display: true,
      text: 'Chart.js Line Chart - Multi Axis'
    },
    scales: {
      yAxes: [
        {
          type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: 'left',
          id: 'y-axis-1'
        },
        {
          type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: 'right',
          id: 'y-axis-2',

          // grid line settings
          gridLines: {
            drawOnChartArea: false // only want the grid lines for one axis to show up
          }
        }
      ]
    }
  };

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

  sourcesForm = this.fb.group({
    datasource: [],
    campaigns: []
  });

  constructor(
    private accountService: AccountService,
    private loginModalService: LoginModalService,
    private eventManager: JhiEventManager,
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      this.loagData();
    });
    this.registerAuthenticationSuccess();
    this.sourcesForm.get('datasource').valueChanges.subscribe(value => {});
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
          this.autocompleteCampaigns.push({ value: source, id: source });
        });
      });
    this.http
      .get<any[]>(`/api/_search/datasources`)
      .pipe(first())
      .subscribe(response => {
        response.forEach(source => {
          this.autocompleteDatasources.push({ value: source, id: source });
        });
      });
    this.http
      .get<any[]>(`/api/_search/datagram/*`)
      .pipe(first())
      .subscribe(response => {
        this.myDataSets = [];
        response.forEach(day => {
          const lineDate = new Date(day.day);
          this.data.labels.push(lineDate.toLocaleDateString());
          this.data.datasets[0].data.push(day.clicks);
          this.data.datasets[1].data.push(day.impresions);
        });
      });
  }

  requestAutocompleteItems(text: string): Observable<any> {
    return this.http.get<any[]>(`/api/_search/datasources`).pipe(
      first(),
      map(response => {
        response.forEach(source => {
          this.autocompleteCampaigns.push({ value: source, id: source });
        });
        return this.autocompleteCampaigns;
      })
    );
  }

  filterChanged() {
    // console.log(this.modelDatasources);
    let searchString = '';
    let i = 0;
    if (this.modelDatasources) {
      this.modelDatasources.forEach(element => {
        if (i > 0) {
          searchString += ' OR ';
        }
        i += 1;
        searchString += '(datasource:' + element.id + ')';
      });
    }
    if (this.modelCampaigns) {
      this.modelCampaigns.forEach(element => {
        if (i > 0) {
          searchString += ' OR ';
        }
        i += 1;
        searchString += '(campaign:' + element.id + ')';
      });
    }
    if ((!this.modelDatasources || this.modelDatasources.length === 0) && (!this.modelCampaigns || this.modelCampaigns.length === 0)) {
      searchString = '*';
    }
    this.data.labels = [];
    this.data.datasets[0].data = [];
    this.data.datasets[1].data = [];
    this.http
      .get<any[]>(`/api/_search/datagram/${searchString}`)
      .pipe(first())
      .subscribe(response => {
        this.myDataSets = [];
        response.forEach(day => {
          const lineDate = new Date(day.day);
          this.data.labels.push(lineDate.toLocaleDateString());
          this.data.datasets[0].data.push(day.clicks);
          this.data.datasets[1].data.push(day.impresions);
        });
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
