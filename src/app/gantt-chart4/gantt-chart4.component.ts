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
        height: 24,
        gap: 4,
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
    const dates = this.createBasicCanvas(
      this.datesId,
      this.datesWidth,
      this.config.dates.months.height + this.config.dates.days.height);
    this.drawDates(dates);

    // グループの描画
    const groups = this.createBasicCanvas(
      this.groupsId,
      this.config.groups.width,
      this.tasksHeight);
    this.drawGroups(groups);

    // タスクの描画
    const tasks = this.createBasicCanvas(
      this.tasksId,
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
   */
  private drawCorner(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    // bottom line
    canvas.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.groups.width)
      .attr('y1', this.config.dates.months.height + this.config.dates.days.height)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // right line
    canvas.append('line')
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

    // year month text
    dates.append('text')
      .filter((d, i) => i === 0 || moment(d).date() === 1)
      .text(d => d3.timeFormat('%Y-%m')(d))
      .attr('x', this.config.dates.days.day.width / 2)
      .attr('y', this.config.dates.months.height / 2)
      .attr('font-size', 11)
      .attr('dominant-baseline', 'central');

    // days text
    datesExceptToday.append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.day.width / 2)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // today circle
    datesToday.append('circle')
      .attr('cx', this.config.dates.days.day.width / 2)
      .attr('cy', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('r', this.config.dates.months.height / 2)
      .attr('fill', 'red')

    // todays text
    datesToday.append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.days.day.width / 2)
      .attr('y', this.config.dates.months.height + this.config.dates.days.height / 2)
      .attr('font-size', 11)
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // first day of month line
    dates.append('line')
      .filter(d => moment(d).date() === moment(d).daysInMonth())
      .attr('x1', this.config.dates.days.day.width)
      .attr('x2', this.config.dates.days.day.width)
      .attr('y1', 0)
      .attr('y2', this.config.dates.months.height + this.config.dates.days.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // bottom line
    canvas.append('line')
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
    groups.append('text')
      .text(d => d.name)
      .attr('x', 0)
      .attr('y', d => this.getGroupHeight(d.tasks.length) / 2)
      .attr('font-size', 11)

    // group line
    groups.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.groups.width)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)

    // right line
    canvas.append('line')
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
    dates.append('line')
      .attr('x1', this.config.dates.days.day.width)
      .attr('x2', this.config.dates.days.day.width)
      .attr('y1', 0)
      .attr('y2', this.tasksHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // today line
    datesToday.append('line')
      .attr('x1', this.config.dates.days.day.width / 2)
      .attr('x2', this.config.dates.days.day.width / 2)
      .attr('y1', 0)
      .attr('y2', this.tasksHeight)
      .attr('stroke-width', 1)
      .attr('stroke', 'red');

    // holiday back groupnd
    datesHoliday.append('rect')
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
    groups.append('line')
      .attr('x1', 0)
      .attr('x2', this.datesWidth)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
  }

  /**
   * タスクの描画
   */
  private drawTasks(
    canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    const groups = this.getGroupsSelection(canvas);
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

    // グループトップ位置
    const getGroupTop = (index: number): number => {
      return this.groupedTasks.reduce((p, c, i) => {
        return p += i < index ? this.getGroupHeight(c.tasks.length) : 0;
      }, 0);
    };

    return canvas.selectAll('.groups')
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
      this.config.groups.taskPaddingTop + this.config.groups.taskPaddingBottom;
  };

  /**
   * タスクのトップ位置の取得
   */
  private getTaskTop(index: number): number {
    return this.config.groups.taskPaddingTop +
      this.config.tasks.task.height * index +
      this.config.tasks.task.gap * index;
  };

  /**
   * タスクの左位置の取得
   */
  private getTaskLeft(date: Date): number {
    return this.datesWidth * (this.dates).findIndex(d => moment(d).isSame(date));
  };
}
