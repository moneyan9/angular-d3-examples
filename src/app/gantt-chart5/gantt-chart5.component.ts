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
  progressRate: number;
  details?: string;
}

@Component({
  selector: 'app-gantt-chart5',
  templateUrl: './gantt-chart5.component.html',
  styleUrls: ['./gantt-chart5.component.scss']
})
export class GanttChart5Component implements OnInit, AfterViewInit {

  cornerId = `chart_${UUID.UUID()}`;
  datesId = `chart_${UUID.UUID()}`;
  groupsId = `chart_${UUID.UUID()}`;
  tasksId = `chart_${UUID.UUID()}`;

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
      paddingTop: 5,
      paddingBottom: 5,
    },
    tasks: {
      height: undefined,
      task: {
        height: 15,
        gap: 10,
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
            progressRate: 40,
            details: 'This actually did\'nt take any conceptualization'
          },
          {
            name: 'sketch',
            startTime: new Date('2013-2-1'),
            endTime: new Date('2013-2-6'),
            progressRate: 20,
            details: 'No sketching either, really'
          },
          {
            name: 'color profiles',
            startTime: new Date('2013-2-6'),
            endTime: new Date('2013-2-9'),
            progressRate: 50,
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
            progressRate: 10,
            details: 'all three lines of it'
          },
          {
            name: 'write the JS',
            startTime: new Date('2013-2-6'),
            endTime: new Date('2013-2-9'),
            progressRate: 5,
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
            progressRate: 70,
            details: 'This counts, right?'
          },
          {
            name: 'spam links',
            startTime: new Date('2013-2-12'),
            endTime: new Date('2013-2-14'),
            progressRate: 90,
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
            details: 'All the things',
            progressRate: 45,
          },
          {
            name: 'crying',
            startTime: new Date('2013-2-13'),
            endTime: new Date('2013-5-16'),
            progressRate: 95,
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
            progressRate: 80,
            details: 'This actually did\'nt take any conceptualization'
          },
          {
            name: 'yyy',
            startTime: new Date('2013-2-1'),
            endTime: new Date('2013-2-6'),
            progressRate: 30,
            details: 'No sketching either, really'
          },
          {
            name: 'zzz',
            startTime: new Date('2013-2-6'),
            endTime: new Date('2013-2-9'),
            progressRate: 100,
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
   * 今日へスクロール
   */
  scrollToToday() {
    const element = document.getElementById(this.tasksId);
    const todayElement = document.getElementById('today');
    console.log(todayElement)
    const elemtop = todayElement.getBoundingClientRect().x;

    // -30は微調整分
    element.scrollLeft += elemtop + -30;
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

    // 日付コンテナーの描画
    const dateContainer = this.createDateContainer();
    this.drawDateContainer(dateContainer);

    // 日付の描画
    const dates = this.createDates(dateContainer);
    this.drawDates(dates);

    // グループコンテナーの描画
    const groupContainer = this.createGroupContainer();
    this.drawGroupContainer(groupContainer);

    // グループの描画
    const groups = this.createGroups(groupContainer);
    this.drawGroups(groups);

    // タスクコンテナーの描画
    const taskContainer = this.createTaskContainer();

    // 日付線の描画
    const dateLines = this.createDates(taskContainer);
    this.drawDateLines(dateLines);

    // タスクの描画
    const tasks = this.createTasks(taskContainer);
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
   * 日付コンテナーの生成
   */
  private createDateContainer(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.datesId}`)
      .append('svg')
      .attr('width', this.config.dates.width)
      .attr('height', this.config.dates.months.height + this.config.dates.days.height);
  }

  /**
   * 日付コンテナーの描画
   */
  private drawDateContainer(
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
  private drawDates(
    dates: d3.Selection<SVGGElement, Date, SVGSVGElement, unknown>
  ) {
    const today = moment(new Date('2013-2-12'));
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
      .attr('id', 'today');

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
   * グループコンテナーの生成
   */
  private createGroupContainer(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {

    return d3.select(`#${this.groupsId}`)
      .append('svg')
      .attr('width', this.config.groups.width)
      .attr('height', this.config.tasks.height);
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
   * タスクコンテナーの生成
   */
  private createTaskContainer(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.tasksId}`)
      .append('svg')
      .attr('width', this.config.dates.width)
      .attr('height', this.config.tasks.height);
  }

  /**
   * タスクの生成
   */
  private createTasks(taskContainer: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>)
    : d3.Selection<SVGGElement, Task, SVGGElement, Group> {

    const getGroupTop = (index: number): number => {
      return this.groupedTasks.reduce((p, c, i) => {
        return p += i < index ? this.getGroupHeight(c.tasks.length) : 0;
      }, 0);
    };

    // 下線
    taskContainer.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.dates.width)
      .attr('y1', taskContainer.node().clientHeight)
      .attr('y2', taskContainer.node().clientHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    return taskContainer
      .selectAll('.groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'groups')
      .attr('transform', (d, i) => `translate(0, ${getGroupTop(i)})`)
      .selectAll('.tasks')
      .data(d => d.tasks)
      .enter()
      .append('g')
      .attr('class', 'task')
      .attr('transform', d => `translate(${this.getTaskLeft(d.startTime)}, ${this.getTaskTopInGroup(d)})`);
  }


  /**
   * 日付線の描画
   */
  private drawDateLines(
    dates: d3.Selection<SVGGElement, Date, SVGSVGElement, unknown>
  ) {
    const today = moment(new Date('2013-2-12'));
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
    todayDate
      .append('line')
      .attr('x1', this.config.dates.days.width / 2)
      .attr('x2', this.config.dates.days.width / 2)
      .attr('y1', 0)
      .attr('y2', dates.node().parentElement.clientHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', '#F9410B')
      .attr('id', 'today');
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
    const rect = tasks
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
  };
}
