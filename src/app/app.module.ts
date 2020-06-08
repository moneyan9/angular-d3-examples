import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import { GanttChart2Component } from './gantt-chart2/gantt-chart2.component';
import { GanttChart3Component } from './gantt-chart3/gantt-chart3.component';

@NgModule({
  declarations: [
    AppComponent,
    GanttChartComponent,
    GanttChart2Component,
    GanttChart3Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
