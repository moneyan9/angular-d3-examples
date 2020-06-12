import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UUID } from 'angular2-uuid';
import * as d3 from 'd3';
import * as moment from 'moment'

type Group = {
  name: string;
  tasks: Task[];
}

type Task = {
  name: string;
  startTime: Date;
  endTime: Date;
  details?: string;
}

@Component({
  selector: 'app-gantt-chart4',
  templateUrl: './gantt-chart4.component.html',
  styleUrls: ['./gantt-chart4.component.scss']
})
export class GanttChart4Component implements OnInit, AfterViewInit {

  cornerId = `chart_${UUID.UUID()}`;
  datesId = `chart_${UUID.UUID()}`;
  groupsId = `chart_${UUID.UUID()}`;
  tasksId = `chart_${UUID.UUID()}`;

  private config = {
    stroke: {
      width: 0.5,
      color: '#dadada',
    },
    dates: {
      width: undefined,
      days: {
        data: undefined,
        width: 28,
        height: 20,
      },
      months: {
        height: 20,
      }
    },
    groups: {
      width: 200,
      paddingTop: 4,
      paddingBottom: 4,
    },
    tasks: {
      height: undefined,
      task: {
        height: 24,
        gap: 4,
      },
    }
  }

  private groupedTasks: Group[] = [
    {
      name: 'development',
      tasks:
        [
          {
            name: 'conceptualize',
            startTime: new Date('2013-1-28'),
            endTime: new Date('2013-2-1'),
            details: 'This actually did\'nt take any conceptualization'
          },
          {
            name: 'sketch',
            startTime: new Date('2013-2-1'),
            endTime: new Date('2013-2-6'),
            details: 'No sketching either, really'
          },
          {
            name: 'color profiles',
            startTime: new Date('2013-2-6'),
            endTime: new Date('2013-2-9')
          },
        ]
    },
    {
      name: 'coding',
      tasks:
        [
          {
            name: 'HTML',
            startTime: new Date('2013-2-2'),
            endTime: new Date('2013-2-6'),
            details: 'all three lines of it'
          },
          {
            name: 'write the JS',
            startTime: new Date('2013-2-6'),
            endTime: new Date('2013-2-9')
          },
        ]
    },
    {
      name: 'promotion',
      tasks:
        [
          {
            name: 'advertise',
            startTime: new Date('2013-2-9'),
            endTime: new Date('2013-2-12'),
            details: 'This counts, right?'
          },
          {
            name: 'spam links',
            startTime: new Date('2013-2-12'),
            endTime: new Date('2013-2-14')
          },
        ]
    },
    {
      name: 'celebration',
      tasks:
        [
          {
            name: 'eat',
            startTime: new Date('2013-2-8'),
            endTime: new Date('2013-2-13'),
            details: 'All the things'
          },
          {
            name: 'crying',
            startTime: new Date('2013-2-13'),
            endTime: new Date('2013-5-16')
          },
        ]
    },
    {
      name: 'meeting',
      tasks:
        [
          {
            name: 'xxx',
            startTime: new Date('2013-1-28'),
            endTime: new Date('2013-2-1'),
            details: 'This actually did\'nt take any conceptualization'
          },
          {
            name: 'yyy',
            startTime: new Date('2013-2-1'),
            endTime: new Date('2013-2-6'),
            details: 'No sketching either, really'
          },
          {
            name: 'zzz',
            startTime: new Date('2013-2-6'),
            endTime: new Date('2013-2-9')
          },
        ]
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.drawGanttChart();
  }

  /**
   * ガントチャートの描画
   */
  private drawGanttChart() {

    // 初期化
    this.initializeConfig();

    // コーナーの描画
    const corner = this.createCorner();
    this.drawCorner(corner);

    // 日付の描画
    const dates = this.createDates();
    this.drawDates(dates);

    // グループの描画
    const groups = this.createGroups();
    this.drawGroups(groups);

    // タスクの描画
    const tasks = this.createTasks();
    this.drawTasks(tasks);
  }

  /**
   * 設定の初期化
   */
  private initializeConfig() {
    const allTasks = this.groupedTasks.reduce((p: Task[], c) => { return [...p, ...c.tasks] }, []);
    const minDate = d3.min(allTasks.map(task => task.startTime));
    const maxDate = d3.max(allTasks.map(task => task.endTime));
    const dates: Date[] = [];
    for (let d = minDate; d <= maxDate; d = moment(d).add(1, 'days').toDate()) { dates.push(new Date(d)); }

    this.config.dates.days.data = dates;
    this.config.dates.width = this.config.dates.days.width * dates.length;
    this.config.tasks.height = this.groupedTasks.reduce((p, c) => p += this.getGroupHeight(c.tasks.length), 0);
  }

  /**
   * コーナーの生成
   */
  private createCorner(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.cornerId}`)
      .append('svg')
      .attr('width', this.config.groups.width)
      .attr('height', this.config.dates.months.height + this.config.dates.days.height);
  }

  /**
   * コーナーの描画
   */
  private drawCorner(
    corner: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    corner.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.groups.width)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    corner.append('line')
      .attr('x1', this.config.groups.width)
      .attr('x2', this.config.groups.width)
      .attr('y1', 0)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * 日付の生成
   */
  private createDates(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.datesId}`)
      .append('svg')
      .attr('width', this.config.dates.width)
      .attr('height', this.config.dates.months.height + this.config.dates.days.height);
  }

  /**
   * 日付の描画
   */
  private drawDates(
    dates: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    dates.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.dates.width)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * グループの生成
   */
  private createGroups(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.groupsId}`)
      .append('svg')
      .attr('width', this.config.groups.width)
      .attr('height', this.config.tasks.height);
  }

  /**
   * グループの描画
   */
  private drawGroups(
    groups: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    groups.append('line')
      .attr('x1', this.config.groups.width)
      .attr('x2', this.config.groups.width)
      .attr('y1', 0)
      .attr('y2', this.config.tasks.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * タスクの生成
   */
  private createTasks(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.tasksId}`)
      .append('svg')
      .attr('width', this.config.dates.width)
      .attr('height', this.config.tasks.height);
  }

  /**
   * タスクの描画
   */
  private drawTasks(
    groups: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
  }

  /**
   * グループの高さの取得
   */
  private getGroupHeight(taskLength: number): number {
    return this.config.tasks.task.height * taskLength +
      this.config.tasks.task.gap * (taskLength - 1) +
      this.config.groups.paddingTop + this.config.groups.paddingBottom;
  };
}
