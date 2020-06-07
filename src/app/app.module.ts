import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import { GanttChart2Component } from './gantt-chart2/gantt-chart2.component';

@NgModule({
  declarations: [
    AppComponent,
    GanttChartComponent,
    GanttChart2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
