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
  selector: 'app-gantt-chart3',
  templateUrl: './gantt-chart3.component.html',
  styleUrls: ['./gantt-chart3.component.scss']
})
export class GanttChart3Component implements OnInit, AfterViewInit {

  chartId = `chart_${UUID.UUID()}`;

  private config = {
    base: {
      width: undefined,
      height: undefined,
      dates: undefined,
    },
    container: {
      width: 0,
      height: 0,
    },
    stroke: {
      width: 0.5,
      color: '#dadada',
    },
    yearMonth: {
      height: 20,
    },
    dates: {
      width: 28,
      height: 20,
    },
    group: {
      width: 200,
      paddingTop: 4,
      paddingBottom: 4,
    },
    task: {
      height: 24,
      gap: 4,
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

  constructor() {
  }

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

    // コンテナの描画
    const container = this.createContainer();
    this.drawContainer(container);

    // 日付の描画
    const dates = this.createDates(container);
    this.drawDates(dates)

    // グループの描画
    const groups = this.createGroups(container);
    this.drawGroups(groups)

    // タスクの描画
    const tasks = this.createTasks(container);
    this.drawTasks(tasks)
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

    this.config.base.dates = dates;
    this.config.base.width = this.config.group.width + this.config.dates.width * dates.length;
    this.config.base.height = this.config.yearMonth.height + this.config.dates.height +
      this.groupedTasks.reduce((p, c) => p += this.getGroupHeight(c.tasks.length), 0);
  }

  /**
   * コンテナの生成
   */
  private createContainer(): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.select(`#${this.chartId}`)
      .append('svg')
      .attr('width', this.config.base.width)
      .attr('height', this.config.base.height);
  }

  /**
   * コンテナの描画
   */
  private drawContainer(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    // コンテナ
    container.append('rect')
      .attr('x', this.config.stroke.width)
      .attr('y', this.config.stroke.width)
      .attr('width', this.config.base.width - this.config.stroke.width * 2)
      .attr('height', this.config.base.height - this.config.stroke.width * 2)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
      .attr('fill', 'none');

    // 行ヘッダー
    container.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.base.width)
      .attr('y1', this.config.yearMonth.height + this.config.dates.height)
      .attr('y2', this.config.yearMonth.height + this.config.dates.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // 列ヘッダー
    container.append('line')
      .attr('x1', this.config.group.width)
      .attr('x2', this.config.group.width)
      .attr('y1', 0)
      .attr('y2', this.config.base.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);
  }

  /**
   * 日付の生成
   */
  private createDates(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Date, SVGSVGElement, unknown> {
    return container.selectAll('.dates')
      .data(this.config.base.dates as Date[])
      .enter()
      .append('g')
      .attr('class', 'dates')
      .attr('transform', (d, i) => {
        const datesLeft = this.config.group.width + this.config.dates.width * i;
        return `translate(${datesLeft}, 0)`
      });
  }

  /**
   * 日付の描画
   */
  private drawDates(
    dates: d3.Selection<SVGGElement, Date, SVGSVGElement, unknown>
  ) {
    const datesToday = dates.filter(d => moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));
    const datesExceptToday = dates.filter(d => !moment(d).startOf('day').isSame(moment('2013-02-05'), 'day'));
    const datesHoliday = dates.filter(d => moment(d).isoWeekday() === 6 || moment(d).isoWeekday() === 7);
    console.log(datesHoliday);

    // 年月
    dates.append('text')
      .filter((d, i) => i === 0 || moment(d).date() === 1)
      .text(d => d3.timeFormat('%Y-%m')(d))
      .attr('x', this.config.dates.width * 0.5)
      .attr('y', this.config.yearMonth.height / 2)
      .attr('font-size', 11)
      .attr('dominant-baseline', 'central');

    // 日付（今日以外）
    datesExceptToday.append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.width * 0.5)
      .attr('y', this.config.yearMonth.height + this.config.dates.height / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // 休日
    datesHoliday.append('rect')
      .attr('x', 0)
      .attr('y', this.config.yearMonth.height + this.config.dates.height)
      .attr('width', this.config.dates.width)
      .attr('height', dates.node().parentElement.clientHeight)
      .attr('fill', '#f5f5f5');

    // 日付線（右側）
    dates.append('line')
      .attr('x1', this.config.dates.width)
      .attr('x2', this.config.dates.width)
      .attr('y1', (d, i, s) => {
        if (i === s.length - 1 ||
          moment(d).date() === moment(d).daysInMonth()) {
          return 0;
        } else {
          return this.config.yearMonth.height + this.config.dates.height;
        }
      })
      .attr('y2', dates.node().parentElement.clientHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

    // 日付円（今日）
    datesToday.append('circle')
      .attr('cx', this.config.dates.width / 2)
      .attr('cy', this.config.yearMonth.height + this.config.dates.height / 2)
      .attr('r', this.config.yearMonth.height / 2)
      .attr('fill', 'red')

    // 日付（今日）
    datesToday.append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.width * 0.5)
      .attr('y', this.config.yearMonth.height + this.config.dates.height / 2)
      .attr('font-size', 11)
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // 日付線（今日）
    datesToday.append('line')
      .attr('x1', this.config.dates.width / 2)
      .attr('x2', this.config.dates.width / 2)
      .attr('y1', this.config.yearMonth.height + this.config.dates.height)
      .attr('y2', dates.node().parentElement.clientHeight)
      .attr('stroke-width', 1)
      .attr('stroke', 'red');
  }

  /**
   * グループの生成
   */
  private createGroups(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Group, SVGSVGElement, unknown> {

    // グループトップ位置
    const getGroupTop = (index: number): number => {
      return this.groupedTasks.reduce((p, c, i) => {
        return p += i < index ? this.getGroupHeight(c.tasks.length) : 0;
      }, 0);
    };

    return container.selectAll('.groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'groups')
      .attr('transform', (d, i) => {
        const groupTop = this.config.yearMonth.height + this.config.dates.height + getGroupTop(i)
        return `translate(0, ${groupTop})`
      });
  }

  /**
   * グループの描画
   */
  private drawGroups(
    groups: d3.Selection<SVGGElement, Group, SVGSVGElement, unknown>
  ) {
    // グループ線（下側）
    groups.append('line')
      .attr('x1', 0)
      .attr('x2', groups.node().parentElement.clientWidth)
      .attr('y1', d => this.getGroupHeight(d.tasks.length))
      .attr('y2', d => this.getGroupHeight(d.tasks.length))
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)

    // グループテキスト
    groups.append('text')
      .text(d => d.name)
      .attr('x', 0)
      .attr('y', d => this.getGroupHeight(d.tasks.length) / 2)
      .attr('font-size', 11)
  }

  /**
   * タスクの生成
   */
  private createTasks(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Task, SVGSVGElement, unknown> {
    const allTasks = this.groupedTasks.reduce((p: Task[], c) => { return [...p, ...c.tasks] }, []);
    return container.selectAll('.tasks')
      .data(allTasks)
      .enter()
      .append('g')
      .attr('class', 'tasks')
      .attr('transform', (d, i) => {
        const taskLeft = this.config.group.width + this.getTaskLeft(d.startTime);
        const taskTop = this.config.yearMonth.height + this.config.dates.height + this.getTaskTop(i)
        return `translate(${taskLeft}, ${taskTop})`
      });
  }

  /**
   * タスクの描画
   */
  private drawTasks(
    tasks: d3.Selection<SVGGElement, Task, SVGSVGElement, unknown>
  ) {
    tasks.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.config.dates.width)
      .attr('height', this.config.task.height)
      .attr('fill', 'skyblue');
  }

  /**
   * グループの高さの取得
   */
  private getGroupHeight(taskLength: number): number {
    return this.config.task.height * taskLength +
      this.config.task.gap * (taskLength - 1) +
      this.config.group.paddingTop + this.config.group.paddingBottom;
  };

  /**
   * タスクのトップ位置の取得
   */
  private getTaskTop(index: number): number {
    return this.config.group.paddingTop +
      this.config.task.height * index +
      this.config.task.gap * index;
  };

  /**
   * タスクの左位置の取得
   */
  private getTaskLeft(date: Date): number {
    return this.config.dates.width * (this.config.base.dates as Date[]).findIndex(d => moment(d).isSame(date));
  };
}
