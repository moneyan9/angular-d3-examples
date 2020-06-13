import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UUID } from 'angular2-uuid';
import * as d3 from 'd3';
import * as moment from 'moment'

// モデル
import { Group } from '../types/group';
import { Task } from '../types/task';

// サービス
import { TasksService } from '../services/tasks.service';

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

  private groupedTasks: Group[];
  private dates: Date[] = undefined;
  private datesWidth: number = undefined;
  private tasksHeight: number = undefined;

  private config = {
    stroke: {
      width: 0.5,
      color: '#dadada',
    },
    dates: {
      days: {
        height: 20,
        day: {
          width: 28,
        }
      },
      months: {
        height: 20,
      }
    },
    groups: {
      width: 200,
      taskPaddingTop: 4,
      taskPaddingBottom: 4,
    },
    tasks: {
      task: {
        height: 16,
        gap: 8,
      },
    }
  }

  constructor(
    private srvTasks: TasksService
  ) { }

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
    this.initialize();

    // コーナーの描画
    const corner = this.createBasicCanvas(
      this.cornerId,
      this.config.groups.width,
      this.config.dates.months.height + this.config.dates.days.height);
    this.drawCorner(corner);

    // 日付の描画
    const datesCanvas = this.createBasicCanvas(
      this.datesId,
      this.datesWidth,
      this.config.dates.months.height + this.config.dates.days.height);
    this.drawDates(datesCanvas);

    // グループの描画
    const groupsCanvas = this.createBasicCanvas(
      this.groupsId,
      this.config.groups.width,
      this.tasksHeight);
    this.drawGroups(groupsCanvas);

    // タスクの描画
    const tasksCanvas = this.createBasicCanvas(
      this.tasksId,
      this.datesWidth,
      this.tasksHeight);
    this.drawTasksDates(tasksCanvas);
    // this.drawTasksGroups(tasksCanvas);
    this.drawTasks(tasksCanvas);
  }

  /**
   * 初期化
   */
  private initialize() {
    this.groupedTasks = this.srvTasks.get();

    const allTasks = this.groupedTasks.reduce((p: Task[], c) => { return [...p, ...c.tasks] }, []);
    const minDate = d3.min(allTasks.map(task => task.startTime));
    const maxDate = d3.max(allTasks.map(task => task.endTime));
    const dates: Date[] = [];
    for (let d = minDate; d <= maxDate; d = moment(d).add(1, 'days').toDate()) { dates.push(new Date(d)); }

    this.dates = dates;
    this.datesWidth = this.config.dates.days.day.width * dates.length;
    this.tasksHeight = this.groupedTasks.reduce((p, c) => p += this.getGroupHeight(c.tasks.length), 0);
  }

  /**
   * コーナーの描画
   */
  private drawCorner(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    // bottom line
    canvas
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.config.groups.width)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // right line
    canvas
      .append('line')
      .attr('x1', this.config.groups.width)
      .attr('x2', this.config.groups.width)
      .attr('y1', 0)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * 日付の描画
   */
  private drawDates(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const dates = this.getDatesSelection(canvas);
    const datesToday = dates.filter(d => moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));
    const datesExceptToday = dates.filter(d => !moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));
    const firstDayOfMonth = dates.filter((d, i) => i === 0 || moment(d).date() === 1);
    const lastDayOfMonth = dates.filter(d => moment(d).date() === moment(d).daysInMonth());

    // year month text
    firstDayOfMonth
      .append('text')
      .text(d => d3.timeFormat('%Y-%m')(d))
      .attr('x', this.config.dates.days.day.width / 2)
      .attr('y', this.config.dates.months.height / 2)
      .attr('font-size', 11)
      .attr('dominant-baseline', 'central');

    // days text
    datesExceptToday
      .append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.day.width / 2)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // today circle
    datesToday
      .append('circle')
      .attr('cx', this.config.dates.days.day.width / 2)
      .attr('cy', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('r', this.config.dates.months.height / 2)
      .attr('fill', 'red')

    // todays text
    datesToday
      .append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.day.width / 2)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // first day of month line
    lastDayOfMonth
      .append('line')
      .attr('x1', this.config.dates.days.day.width)
      .attr('x2', this.config.dates.days.day.width)
      .attr('y1', 0)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // bottom line
    canvas
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.datesWidth)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * グループの描画
   */
  private drawGroups(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const groups = this.getGroupsSelection(canvas);

    // group text
    groups
      .append('text')
      .text(d => d.name)
      .attr('x', 0)
      .attr('y', d => this.getGroupHeight(d.tasks.length) / 2)
      .attr('font-size', 11)

    // group line
    groups
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.config.groups.width)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)

    // right line
    canvas
      .append('line')
      .attr('x1', this.config.groups.width)
      .attr('x2', this.config.groups.width)
      .attr('y1', 0)
      .attr('y2', this.tasksHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * タスク（日付）の描画
   */
  private drawTasksDates(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const dates = this.getDatesSelection(canvas);
    const datesToday = dates.filter(d => moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));
    const datesHoliday = dates.filter(d => moment(d).isoWeekday() === 6 || moment(d).isoWeekday() === 7);

    // days line
    dates
      .append('line')
      .attr('x1', this.config.dates.days.day.width)
      .attr('x2', this.config.dates.days.day.width)
      .attr('y1', 0)
      .attr('y2', this.tasksHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // today line
    datesToday
      .append('line')
      .attr('x1', this.config.dates.days.day.width / 2)
      .attr('x2', this.config.dates.days.day.width / 2)
      .attr('y1', 0)
      .attr('y2', this.tasksHeight)
      .attr('stroke-width', 1)
      .attr('stroke', 'red');

    // holiday back groupnd
    datesHoliday
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.config.dates.days.day.width)
      .attr('height', this.tasksHeight)
      .attr('fill', '#f5f5f5');
  }

  /**
   * タスクの描画（グループ）
   */
  private drawTasksGroups(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const groups = this.getGroupsSelection(canvas);

    // group line
    groups
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.datesWidth)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
  }
  d
  /**
   * タスクの描画
   */
  private drawTasks(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const tasks = this.getTasksSelection(canvas);

    // カラースケール
    const colorScale = d3.scaleOrdinal()
      .domain(['started', 'inProgress', 'completed'])
      .range(['#80C4E4', '#008ACA', '#56CC27']);

    // スタート又は完了の描画
    const rect = tasks
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', t => {
        let width = 0;
        for (let date = new Date(t.startTime); date <= t.endTime; date = moment(date).add(1, 'days').toDate()) {
          width += this.config.dates.days.day.width;
        }
        return width;
      })
      .attr('height', this.config.tasks.task.height)
      .attr('fill', d => (d.progressRate === 100 ? colorScale('completed') : colorScale('started')) as string);

    // 進捗の描画
    tasks
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', t => {
        if (t.progressRate === 100) { return 0 }
        let width = 0;
        for (let date = new Date(t.startTime); date <= t.endTime; date = moment(date).add(1, 'days').toDate()) {
          width += this.config.dates.days.day.width;
        }
        return t.progressRate / 100 * width;
      })
      .attr('height', this.config.tasks.task.height)
      .attr('fill', colorScale('inProgress') as string);

    // タスク名
    tasks
      .append('text')
      .text(d => d.name)
      .attr('x', t => {
        let width = 0;
        for (let date = new Date(t.startTime); date <= t.endTime; date = moment(date).add(1, 'days').toDate()) {
          width += this.config.dates.days.day.width;
        }
        return width / 2;
      })
      .attr('y', this.config.tasks.task.height / 2)
      .attr('fill', '#fff')
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')

    // task line
    canvas
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.datesWidth)
      .attr('y1', this.tasksHeight)
      .attr('y2', this.tasksHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
  }

  /**
   * ベーシックキャンバスの生成
   */
  private createBasicCanvas(
    id: string,
    width: number,
    height: number,
    attrs?: { name: string, value: string | number | boolean }[]
  ): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${id}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  }

  /**
   * 日付セレクションの生成
   */
  private getDatesSelection(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Date, SVGSVGElement, unknown> {
    return canvas.selectAll('.dates')
      .data(this.dates)
      .enter()
      .append('g')
      .attr('class', 'dates')
      .attr('transform', (d, i) => `translate(${this.config.dates.days.day.width * i}, 0)`);
  }

  /**
   * グループセレクションの生成
   */
  private getGroupsSelection(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Group, SVGSVGElement, unknown> {
    return canvas.selectAll('.groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'groups')
      .attr('transform', d => `translate(0, ${this.getGroupTop(d)})`);
  }

  /**
   * タスクセレクションの生成
   */
  private getTasksSelection(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Task, SVGGElement, Group> {
    return this.getGroupsSelection(canvas)
      .selectAll('.tasks')
      .data(d => d.tasks)
      .enter()
      .append('g')
      .attr('class', 'task')
      .attr('transform', d => `translate(${this.getTaskLeft(d.startTime)}, ${this.getTaskTopInGroup(d)})`);
  }

  /**
   * グループのトップ位置の取得
   */
  private getGroupTop(group: Group): number {
    let top = 0;
    for (const g of this.groupedTasks) {
      if (g === group) { break; }
      top += this.getGroupHeight(g.tasks.length);
    }
    return top;
  };

  /**
   * グループの高さの取得
   */
  private getGroupHeight(taskLength: number): number {
    return this.config.tasks.task.height * taskLength +
      this.config.tasks.task.gap * (taskLength - 1) +
      this.config.groups.taskPaddingTop + this.config.groups.taskPaddingBottom;
  };

  /**
   * タスクの左位置の取得
   */
  private getTaskLeft(date: Date): number {
    return this.config.dates.days.day.width * (this.dates).findIndex(d => moment(d).isSame(date));
  };

  /**
   * グループ内でのタスクのトップ位置の取得
   */
  private getTaskTopInGroup(task: Task) {
    const group = this.groupedTasks.find(g => g.tasks.some(t => t === task));
    let top = this.config.groups.taskPaddingTop;
    for (const t of group.tasks) {
      if (t === task) { break; }
      top += this.config.tasks.task.height + this.config.tasks.task.gap;
    }
    return top;
  }
}
