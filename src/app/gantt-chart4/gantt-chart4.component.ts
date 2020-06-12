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
    const corner = this.createCornerArea();
    this.drawCorner(corner);

    // 日付の描画
    const dates = this.createDatesArea();
    this.drawDates(dates);

    // グループの描画
    const groups = this.createGroupsArea();
    this.drawGroups(groups);

    // タスクの描画
    const tasks = this.createTasksArea();
    this.drawTasksDates(tasks);
    this.drawTasksGroups(tasks);
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
   * コーナーエリアの生成
   */
  private createCornerArea(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.cornerId}`)
      .append('svg')
      .attr('width', this.config.groups.width)
      .attr('height', this.config.dates.months.height + this.config.dates.days.height);
  }

  /**
   * コーナーの描画
   */
  private drawCorner(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.groups.width)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    svg.append('line')
      .attr('x1', this.config.groups.width)
      .attr('x2', this.config.groups.width)
      .attr('y1', 0)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * 日付エリアの生成
   */
  private createDatesArea(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.datesId}`)
      .append('svg')
      .attr('width', this.config.dates.width)
      .attr('height', this.config.dates.months.height + this.config.dates.days.height)
  }

  /**
   * 日付の描画
   */
  private drawDates(
    area: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const dates = this.getDatesSelection(area);
    const datesToday = dates.filter(d => moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));
    const datesExceptToday = dates.filter(d => !moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));

    // 日付線（上）
    area.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.dates.width)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // 年月テキスト
    dates.append('text')
      .filter((d, i) => i === 0 || moment(d).date() === 1)
      .text(d => d3.timeFormat('%Y-%m')(d))
      .attr('x', this.config.dates.days.width / 2)
      .attr('y', this.config.dates.months.height / 2)
      .attr('font-size', 11)
      .attr('dominant-baseline', 'central');

    // 日付テキスト（今日以外）
    datesExceptToday.append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.width / 2)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // 日付サークル（今日）
    datesToday.append('circle')
      .attr('cx', this.config.dates.days.width / 2)
      .attr('cy', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('r', this.config.dates.months.height / 2)
      .attr('fill', 'red')

    // 日付テキスト（今日）
    datesToday.append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.width / 2)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // 月ライン
    dates.append('line')
      .filter(d => moment(d).date() === moment(d).daysInMonth())
      .attr('x1', this.config.dates.days.width)
      .attr('x2', this.config.dates.days.width)
      .attr('y1', 0)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * グループエリアの生成
   */
  private createGroupsArea(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.groupsId}`)
      .append('svg')
      .attr('width', this.config.groups.width)
      .attr('height', this.config.tasks.height);
  }

  /**
   * グループの描画
   */
  private drawGroups(
    area: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const groups = this.getGroupsSelection(area);

    // ライン（上）
    area.append('line')
      .attr('x1', this.config.groups.width)
      .attr('x2', this.config.groups.width)
      .attr('y1', 0)
      .attr('y2', this.config.tasks.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // グループテキスト
    groups.append('text')
      .text(d => d.name)
      .attr('x', 0)
      .attr('y', d => this.getGroupHeight(d.tasks.length) / 2)
      .attr('font-size', 11)

    // グループライン
    groups.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.groups.width)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
  }

  /**
   * タスクエリアの生成
   */
  private createTasksArea(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.tasksId}`)
      .append('svg')
      .attr('width', this.config.dates.width)
      .attr('height', this.config.tasks.height);
  }

  /**
   * タスク（日付）の描画
   */
  private drawTasksDates(
    area: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const dates = this.getDatesSelection(area);
    const datesToday = dates.filter(d => moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));
    const datesHoliday = dates.filter(d => moment(d).isoWeekday() === 6 || moment(d).isoWeekday() === 7);

    // 日付ライン
    dates.append('line')
      .attr('x1', this.config.dates.days.width)
      .attr('x2', this.config.dates.days.width)
      .attr('y1', 0)
      .attr('y2', this.config.tasks.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // 日付ライン（今日）
    datesToday.append('line')
      .attr('x1', this.config.dates.days.width / 2)
      .attr('x2', this.config.dates.days.width / 2)
      .attr('y1', 0)
      .attr('y2', this.config.tasks.height)
      .attr('stroke-width', 1)
      .attr('stroke', 'red');

    // 休日
    datesHoliday.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.config.dates.days.width)
      .attr('height', this.config.tasks.height)
      .attr('fill', '#f5f5f5');
  }

  /**
   * タスクの描画（グループ）
   */
  private drawTasksGroups(
    area: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const groups = this.getGroupsSelection(area);

    // グループライン
    groups.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.dates.width)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
  }

  /**
   * タスクの描画
   */
  private drawTasks(
    area: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const groups = this.getGroupsSelection(area);
  }

  /**
   * 日付セレクションの生成
   */
  private getDatesSelection(
    area: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Date, SVGSVGElement, unknown> {
    return area.selectAll('.dates')
      .data(this.config.dates.days.data as Date[])
      .enter()
      .append('g')
      .attr('class', 'dates')
      .attr('transform', (d, i) => `translate(${this.config.dates.days.width * i}, 0)`);
  }

  /**
   * グループセレクションの生成
   */
  private getGroupsSelection(
    area: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Group, SVGSVGElement, unknown> {

    // グループトップ位置
    const getGroupTop = (index: number): number => {
      return this.groupedTasks.reduce((p, c, i) => {
        return p += i < index ? this.getGroupHeight(c.tasks.length) : 0;
      }, 0);
    };

    return area.selectAll('.groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'groups')
      .attr('transform', (d, i) => `translate(0, ${getGroupTop(i)})`);
  }

  /**
   * グループの高さの取得
   */
  private getGroupHeight(taskLength: number): number {
    return this.config.tasks.task.height * taskLength +
      this.config.tasks.task.gap * (taskLength - 1) +
      this.config.groups.paddingTop + this.config.groups.paddingBottom;
  };

  /**
   * タスクのトップ位置の取得
   */
  private getTaskTop(index: number): number {
    return this.config.groups.paddingTop +
      this.config.tasks.task.height * index +
      this.config.tasks.task.gap * index;
  };

  /**
   * タスクの左位置の取得
   */
  private getTaskLeft(date: Date): number {
    return this.config.dates.width * (this.config.dates.days.data as Date[]).findIndex(d => moment(d).isSame(date));
  };
}
