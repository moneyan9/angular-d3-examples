import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('corner') cornerRef: ElementRef;
  @ViewChild('dates') datesRef: ElementRef;
  @ViewChild('groups') groupsRef: ElementRef;
  @ViewChild('tasks') tasksRef: ElementRef;
  @ViewChild('todayButton') todayButtonRef: ElementRef;

  private groupedTasks: Group[];
  private dates: Date[] = undefined;
  private datesWidth: number = undefined;
  private tasksHeight: number = undefined;
  private today = new Date('2013-02-12');

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
      taskPaddingTop: 8,
      taskPaddingBottom: 8,
    },
    tasks: {
      task: {
        height: 32,
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
    this.setTodayButtonVisibility();
  }

  /**
   * 縦スクロールの同期
   * @param source 同期元
   * @param destination 同期先
   */
  syncHorizontalScroll(source: HTMLElement, destination: HTMLElement) {
    destination.scrollLeft = source.scrollLeft;
  }

  /**
   * 横スクロールの同期
   * @param source 同期元
   * @param destination 同期先
   */
  syncVerticalScroll(source: HTMLElement, destination: HTMLElement) {
    destination.scrollTop = source.scrollTop;
  }

  /**
   * ガントチャートの描画
   */
  private drawGanttChart() {

    // 初期化
    this.initialize();

    // コーナーの描画
    const corner = this.createBasicCanvas(
      this.cornerRef.nativeElement,
      this.config.groups.width,
      this.config.dates.months.height + this.config.dates.days.height);
    this.drawCorner(corner);

    // 日付の描画
    const dates = this.createBasicCanvas(
      this.datesRef.nativeElement,
      this.datesWidth,
      this.config.dates.months.height + this.config.dates.days.height);
    this.drawDates(dates);

    // グループの描画
    const groups = this.createBasicCanvas(
      this.groupsRef.nativeElement,
      this.config.groups.width,
      this.tasksHeight);
    this.drawGroups(groups);

    // タスクの描画
    const tasks = this.createBasicCanvas(
      this.tasksRef.nativeElement,
      this.datesWidth,
      this.tasksHeight);
    this.drawTasksDates(tasks);
    this.drawTasksGroups(tasks);
    this.drawTasks(tasks);
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
   * @param canvas キャンバス
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
   * @param canvas キャンバス
   */
  private drawDates(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const dates = this.getDatesSelection(canvas);
    const datesToday = dates.filter(d => moment(d).startOf('day').isSame(moment(this.today), 'day'));
    const datesExceptToday = dates.filter(d => !moment(d).startOf('day').isSame(moment(this.today), 'day'));
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
   * @param canvas キャンバス
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
   * @param canvas キャンバス
   */
  private drawTasksDates(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const dates = this.getDatesSelection(canvas);
    const datesToday = dates.filter(d => moment(d).startOf('day').isSame(moment(this.today), 'day'));
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
      .attr('stroke-width', this.config.stroke.width)
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
   * @param canvas キャンバス
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

  /**
   * タスクの描画
   * @param canvas キャンバス
   */
  private drawTasks(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const tasks = this.getTasksSelection(canvas);

    // color scale
    const colorScale = d3.scaleOrdinal()
      .domain(['started', 'inProgress', 'completed'])
      .range(['#80C4E4', '#008ACA', '#56CC27']);

    // task rect
    const rect = tasks
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', d => {
        const days = moment(d.endTime).diff(moment(d.startTime), 'days') + 1;
        return this.config.dates.days.day.width * days;
      })
      .attr('height', this.config.tasks.task.height)
      .attr('fill', d => (d.progressRate === 100 ? colorScale('completed') : colorScale('started')) as string);

    // progress rect
    tasks
      .filter(d => d.progressRate !== 100)
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', d => {
        const days = moment(d.endTime).diff(moment(d.startTime), 'days') + 1;
        return this.config.dates.days.day.width * days * d.progressRate / 100
      })
      .attr('height', this.config.tasks.task.height)
      .attr('fill', colorScale('inProgress') as string);

    // taskName text
    tasks
      .append('text')
      .text(d => d.name)
      .attr('x', d => {
        const days = moment(d.endTime).diff(moment(d.startTime), 'days') + 1;
        return this.config.dates.days.day.width * days / 2;
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
   * @param id Id
   * @param width 幅
   * @param height 高さ
   * @param attrs 属性
   * @returns キャンバス
   */
  private createBasicCanvas(
    element: HTMLElement,
    width: number,
    height: number,
    attrs?: { name: string, value: string | number | boolean }[]
  ): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  }

  /**
   * 日付セレクションの生成
   * @param canvas キャンバス
   * @returns セレクション
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
   * @param canvas キャンバス
   * @returns セレクション
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
   * @param canvas キャンバス
   * @returns セレクション
   */
  private getTasksSelection(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Task, SVGGElement, Group> {
    return canvas.selectAll('.task-groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'task-groups')
      .attr('transform', d => `translate(0, ${this.getGroupTop(d)})`)
      .selectAll('.tasks')
      .data(d => d.tasks)
      .enter()
      .append('g')
      .attr('class', 'task')
      .attr('transform', d => `translate(${this.getTaskLeft(d.startTime)}, ${this.getTaskTopInGroup(d)})`);
  }

  /**
   * グループのトップ位置の取得
   * @param group グループ
   * @returns グループのトップ位置
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
   * @param taskLength タスク数
   * @returns グループの高さ
   */
  private getGroupHeight(taskLength: number): number {
    return this.config.tasks.task.height * taskLength +
      this.config.tasks.task.gap * (taskLength - 1) +
      this.config.groups.taskPaddingTop + this.config.groups.taskPaddingBottom;
  };

  /**
   * タスクの左位置の取得
   * @param date 日付
   * @returns タスクの左位置
   */
  private getTaskLeft(date: Date): number {
    return this.config.dates.days.day.width * (this.dates).findIndex(d => moment(d).isSame(date));
  };

  /**
   * グループ内でのタスクのトップ位置の取得
   * @param task タスク
   * @returns タスクのトップ位置
   */
  private getTaskTopInGroup(task: Task): number {
    const group = this.groupedTasks.find(g => g.tasks.some(t => t === task));
    let top = this.config.groups.taskPaddingTop;
    for (const t of group.tasks) {
      if (t === task) { break; }
      top += this.config.tasks.task.height + this.config.tasks.task.gap;
    }
    return top;
  }

  /**
   * Todayボタンの表示状態設定
   */
  private setTodayButtonVisibility() {
  }
}
