import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment'
import { TasksService } from '../services/tasks.service';

type Group = {
  name: string;
  tasks: Task[];
}

type Task = {
  name: string;
  startTime: Date;
  endTime: Date;
  progressRate: number;
  details?: string;
}

@Component({
  selector: 'app-gantt-chart5',
  templateUrl: './gantt-chart5.component.html',
  styleUrls: ['./gantt-chart5.component.scss']
})
export class GanttChart5Component implements OnInit, AfterViewInit {

  @ViewChild('corner') cornerElement: ElementRef;
  @ViewChild('dates') datesElement: ElementRef;
  @ViewChild('groups') groupsElement: ElementRef;
  @ViewChild('tasks') tasksElement: ElementRef;
  @ViewChild('tag') tagElement: ElementRef;
  @ViewChild('todayButton') todayButtonElement: ElementRef;

  todayElemnt: SVGGElement = null;

  private config = {
    stroke: {
      width: 0.5,
      color: '#dadada',
    },
    circle: {
      radius: 10,
      color: '#EF410B'
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
      paddingTop: 10,
      paddingBottom: 10,
    },
    tasks: {
      height: undefined,
      task: {
        height: 15,
        gap: 15,
      },
    }
  }

  groupedTasks: Group[];

  constructor(
    private srvTasks: TasksService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.drawGanttChart();
    this.setTodayButtonVisibility();
    this.scrollToToday();
  }

  /**
   * 今日へスクロール
   */
  scrollToToday() {

    // 1日半分ずらす
    this.tasksElement.nativeElement.scrollLeft =
      this.todayElemnt.getBoundingClientRect().x +
      this.tasksElement.nativeElement.scrollLeft - this.tasksElement.nativeElement.getBoundingClientRect().x
      - this.config.dates.days.width - this.config.dates.days.width / 2;
  }

  /**
   * ガントチャートの描画
   */
  private drawGanttChart() {

    // 初期化
    this.initializeConfig();

    // コーナーの描画
    const cornerContainer = this.createBaseContainer(this.cornerElement.nativeElement, this.config.groups.width,
      this.config.dates.months.height + this.config.dates.days.height);
    this.drawCorner(cornerContainer);

    // 日付の描画
    const dateContainer = this.createBaseContainer(this.datesElement.nativeElement, this.config.dates.width,
      this.config.dates.months.height + this.config.dates.days.height);
    this.drawDate(dateContainer);

    // グループの描画
    const groupContainer =
      this.createBaseContainer(this.groupsElement.nativeElement, this.config.groups.width, this.config.tasks.height);
    this.drawGroup(groupContainer);

    // タスクの描画
    const taskContainer =
      this.createBaseContainer(this.tasksElement.nativeElement, this.config.dates.width, this.config.tasks.height);
    this.drawTask(taskContainer);
  }

  /**
   * 設定の初期化
   */
  private initializeConfig() {
    this.groupedTasks = this.srvTasks.get();

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
   * ベースコンテナーの生成
   */
  private createBaseContainer(
    HTMLElement: HTMLElement,
    width: number,
    height: number,
    attrs?: { name: string, value: string | number | boolean }[]
  ): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {

    return d3.select(HTMLElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
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
   * 日付コンテナーの描画
   */
  private drawDateContainer(
    dates: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    // 日付コンテナーの下線描画
    dates.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.dates.width)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * 日付の生成
   */
  private createDates(dates: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>)
    : d3.Selection<SVGGElement, Date, SVGSVGElement, unknown> {
    return dates.selectAll('.dates')
      .data(this.config.dates.days.data as Date[])
      .enter()
      .append('g')
      .attr('class', 'dates')
      .attr('transform', (d, i) => {
        const datesLeft = this.config.dates.days.width * i;
        return `translate(${datesLeft}, 0)`
      });
  }

  /**
   * 日付の描画
   */
  private drawDate(
    dateContainer: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {

    // 日付コンテナーの描画
    this.drawDateContainer(dateContainer);
    const dates = this.createDates(dateContainer);
    // 日付の描画
    this.drawDates(dates);
  }

  /**
   * 日付の描画
   */
  private drawDates(
    dates: d3.Selection<SVGGElement, Date, SVGSVGElement, unknown>
  ) {
    const today = moment(new Date('2013-4-1'));
    const todayDate = dates.filter(d => moment(d).diff(today) === 0);
    const lastDayOfTheMonths = dates.filter(d => moment(d).date() === moment(d).daysInMonth());

    lastDayOfTheMonths
      .append('line')
      .attr('x1', this.config.dates.days.width)
      .attr('x2', this.config.dates.days.width)
      .attr('y1', 0)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)

    // 年月
    dates.filter((d, i) => i === 0 || moment(d).date() === 1)
      .append('text')
      .text(d => d3.timeFormat('%Y-%m')(d))
      .attr('x', this.config.dates.days.width * 0.5)
      .attr('y', this.config.dates.months.height / 2)
      .attr('font-size', 11)
      .attr('dominant-baseline', 'central');

    // 日付（今日除く）
    dates
      .filter(d => moment(d).diff(today) !== 0)
      .append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.width * 0.5)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // today circle
    todayDate
      .append('circle')
      .attr('cx', this.config.dates.days.width * 0.5)
      .attr('cy', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('r', this.config.circle.radius)
      .style('fill', this.config.circle.color)

    // today text
    todayDate
      .append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.width * 0.5)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');
  }

  /**
   * グループの描画
   */
  private drawGroup(
    groupContainer: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    // グループコンテナーの描画
    this.drawGroupContainer(groupContainer);
    const groups = this.createGroups(groupContainer);
    // グループの描画
    this.drawGroups(groups);
  }

  /**
   * グループコンテナーの描画
   */
  private drawGroupContainer(
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
   * グループの生成
   */
  private createGroups(groupContainer: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>)
    : d3.Selection<SVGGElement, Group, SVGSVGElement, unknown> {

    const getGroupTop = (index: number): number => {
      return this.groupedTasks.reduce((p, c, i) => {
        return p += i < index ? this.getGroupHeight(c.tasks.length) : 0;
      }, 0);
    };

    return groupContainer.selectAll('.groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'groups')
      .attr('transform', (d, i) => `translate(0, ${getGroupTop(i)})`);
  }

  /**
   * グループの描画
   */
  private drawGroups(
    groups: d3.Selection<SVGGElement, Group, SVGSVGElement, unknown>
  ) {

    groups.append('line')
      .attr('x1', 0)
      .attr('x2', groups.node().parentElement.clientWidth)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)

    groups.append('text')
      .text(d => d.name)
      .attr('x', 0)
      .attr('y', d => this.getGroupHeight(d.tasks.length) / 2)
      .attr('font-size', 11)
  }

  /**
   * グループタスクコンテナーの生成
   */
  private createTaskGroupContainer(taskContainer: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>)
    : d3.Selection<SVGGElement, Group, SVGSVGElement, unknown> {

    const getGroupTop = (index: number): number => {
      return this.groupedTasks.reduce((p, c, i) => {
        return p += i < index ? this.getGroupHeight(c.tasks.length) : 0;
      }, 0);
    };

    return taskContainer
      .selectAll('.groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'groups')
      .attr('transform', (d, i) => `translate(0, ${getGroupTop(i)})`)
  }

  /**
   * タスクの描画
   */
  private drawTask(taskContainer: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {

    // タスクコンテナーの描画
    this.drawTaskContainerLine(taskContainer);

    // 日付線の描画
    const dateLines = this.createDates(taskContainer);
    this.drawDateLines(dateLines);

    // グループコンテナーの描画
    const taskGroupContainer = this.createTaskGroupContainer(taskContainer);
    // グループ線の描画
    this.drawTaskGroupLines(taskGroupContainer);

    // タスクの描画
    const tasks = this.createTasks(taskGroupContainer);
    this.drawTasks(tasks);

    // ツールチップの描画
    this.drawToolChip(tasks);
  }

  /**
   * タスクコンテナーのライン描画
   */
  private drawTaskContainerLine(taskContainer: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {

    taskContainer
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.config.dates.days.width * this.config.dates.width)
      .attr('y1', this.config.tasks.height)
      .attr('y2', this.config.tasks.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
  }

  /**
   * タスクの生成
   */
  private createTasks(taskContainer: d3.Selection<SVGGElement, Group, SVGSVGElement, unknown>)
    : d3.Selection<SVGGElement, Task, SVGGElement, Group> {

    return taskContainer
      .selectAll('.tasks')
      .data(d => d.tasks)
      .enter()
      .append('g')
      .attr('class', 'task')
      .attr('transform', d => `translate(${this.getTaskLeft(d.startTime)}, ${this.getTaskTopInGroup(d)})`);
  }

  /**
   * タスクグループラインの描画
   */
  private drawTaskGroupLines(
    taskGroupContainer: d3.Selection<SVGGElement, Group, SVGSVGElement, unknown>
  ) {

    taskGroupContainer
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.config.dates.width)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
  }

  /**
   * 日付線の描画
   */
  private drawDateLines(
    dates: d3.Selection<SVGGElement, Date, SVGSVGElement, unknown>
  ) {
    const today = moment(new Date('2013-4-1'));
    const todayDate = dates.filter(d => moment(d).diff(today) === 0);
    const holiday = dates.filter(d => moment(d).isoWeekday() === 6 || moment(d).isoWeekday() === 7);

    // 日付線
    dates.append('line')
      .attr('x1', this.config.dates.days.width)
      .attr('x2', this.config.dates.days.width)
      .attr('y1', 0)
      .attr('y2', dates.node().parentElement.clientHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // 休日
    holiday.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.config.dates.days.width)
      .attr('height', dates.node().parentElement.clientHeight)
      .attr('fill', '#f5f5f5');

    // today line
    this.todayElemnt = todayDate
      .append('line')
      .attr('x1', this.config.dates.days.width / 2)
      .attr('x2', this.config.dates.days.width / 2)
      .attr('y1', 0)
      .attr('y2', dates.node().parentElement.clientHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', '#F9410B')
      .node();
  }

  /**
   * タスクの描画
   */
  private drawTasks(
    tasks: d3.Selection<SVGGElement, Task, SVGGElement, Group>
  ) {
    // カラースケール
    const states = ['started', 'inProgress', 'completed'];
    const colorScale = d3.scaleOrdinal()
      .domain(states)
      .range(['#80C4E4', '#008ACA', '#56CC27']);

    // スタート又は完了の描画
    tasks
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', t => {
        let width = 0;
        for (let date = new Date(t.startTime); date <= t.endTime; date = moment(date).add(1, 'days').toDate()) {
          width += this.config.dates.days.width;
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
          width += this.config.dates.days.width;
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
          width += this.config.dates.days.width;
        }
        return width / 2;
      })
      .attr('y', this.config.tasks.task.height / 2)
      .attr('fill', '#fff')
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
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
   * グループ内でのタスクの上位置の取得
   */
  private getTaskTopInGroup(task: Task) {
    const group = this.groupedTasks.find(g => g.tasks.some(t => t === task));
    let yPoint = this.config.groups.paddingTop;
    for (const groupTask of group.tasks) {
      if (groupTask === task) { break; }
      yPoint += this.config.tasks.task.height + this.config.tasks.task.gap;
    }
    return yPoint;
  }

  /**
   * タスクの左位置の取得
   */
  private getTaskLeft(date: Date): number {
    return this.config.dates.days.width * (this.config.dates.days.data as Date[]).findIndex(d => moment(d).isSame(date));
  }

  /**
   * ツールチップの描画
   */
  private drawToolChip(
    tasks: d3.Selection<SVGGElement, Task, SVGGElement, Group>
  ) {

    // ツールチップ
    tasks.on('mousemove', () => this.showToolTip())
      .on('mouseout', () => this.hideToolTip());
  }

  /**
   * ツールチップの表示
   */
  private showToolTip() {
    const targetElement = d3.event.currentTarget;
    const selectedData = d3.select<any, Task>(targetElement).data()[0];

    let tag = 'Task: ' + selectedData.name +
      '<br/>' + 'Starts: ' + moment(selectedData.startTime).format('yyyy/MM/DD') +
      '<br/>' + 'Ends: ' + moment(selectedData.endTime).format('yyyy/MM/DD');
    if (selectedData.details) {
      tag += '<br/>' + 'Details: ' + selectedData.details;
    }
    this.tagElement.nativeElement.style.top = '0px';
    this.tagElement.nativeElement.style.left = '0px'
    this.tagElement.nativeElement.innerHTML = tag;
    this.tagElement.nativeElement.style.display = 'block';
    const outputWidth = this.tagElement.nativeElement.getBoundingClientRect().width;
    this.tagElement.nativeElement.style.top = targetElement.getBoundingClientRect().y +
      window.pageYOffset + this.config.tasks.task.height + 10 + 'px';
    this.tagElement.nativeElement.style.left = targetElement.getBoundingClientRect().x +
      d3.mouse(d3.event.currentTarget)[0] + window.pageXOffset - outputWidth / 2 + 'px';
  }

  /**
   * ツールチップの非表示
   */
  private hideToolTip() {
    this.tagElement.nativeElement.style.display = 'none';
  }


  /**
   * Todayボタンの表示非表示設定
   */
  private setTodayButtonVisibility() {

    this.tasksElement.nativeElement.onscroll = () => {
      const todayLineXPoint = this.todayElemnt.getBoundingClientRect().x;
      const taskContainerRect = this.tasksElement.nativeElement.getBoundingClientRect();
      const showTodayButtonRange = { x1: taskContainerRect.x, x2: taskContainerRect.x + taskContainerRect.width };

      // TodayLineが表示画面内の場合は非表示
      if (showTodayButtonRange.x1 < todayLineXPoint && showTodayButtonRange.x2 > todayLineXPoint) {
        this.todayButtonElement.nativeElement.style.display = 'none';
        return;
      }

      // TodayLineが表示画面の左側に隠れている場合
      if (showTodayButtonRange.x1 > todayLineXPoint) {
        const cornerRect = this.cornerElement.nativeElement.getBoundingClientRect();
        this.todayButtonElement.nativeElement.innerHTML = '<div>Today ⇐</div>';
        this.todayButtonElement.nativeElement.style.display = 'block';
        this.todayButtonElement.nativeElement.style.top = cornerRect.y + 5 + window.pageYOffset + 'px';
        this.todayButtonElement.nativeElement.style.left = cornerRect.x + 5 + window.pageXOffset + 'px';
        this.todayButtonElement.nativeElement.style.whiteSpace = 'nowrap';
        return;
      }

      // TodayLineが表示画面の右側に隠れている場合
      if (showTodayButtonRange.x2 < todayLineXPoint) {
        const datesRect = this.datesElement.nativeElement.getBoundingClientRect();
        this.todayButtonElement.nativeElement.innerHTML = '<div>Today ⇒</div>';
        this.todayButtonElement.nativeElement.style.display = 'block';
        this.todayButtonElement.nativeElement.style.top = datesRect.y + 5 + window.pageYOffset + 'px';
        this.todayButtonElement.nativeElement.style.left = datesRect.x + datesRect.width -
          this.todayButtonElement.nativeElement.getBoundingClientRect().width - 5 + window.pageXOffset + 'px';
        this.todayButtonElement.nativeElement.style.whiteSpace = 'nowrap';
        return;
      }
    }
  }
}
