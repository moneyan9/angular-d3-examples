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
  selector: 'app-gantt-chart2',
  templateUrl: './gantt-chart2.component.html',
  styleUrls: ['./gantt-chart2.component.scss']
})
export class GanttChart2Component implements OnInit, AfterViewInit {

  chartId = `chart_${UUID.UUID()}`;

  private config = {
    base: {
      width: undefined,
      height: undefined,
      dates: undefined,
    },
    container: {
      width: 800,
      height: 0,
    },
    stroke: {
      width: 0.5,
      color: '#dadada',
      todayColor: 'red',
    },
    circle: {
      radius: 10,
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
      paddingTop: 5,
      paddingBottom: 5,
    },
    task: {
      height: 15,
      gap: 10,
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

  constructor() {
  }


  /**
   * 今日へスクロール
   */
  scrollToToday() {
    const element = document.getElementById(this.chartId);
    const todayElement = document.getElementById('today');
    const elemtop = todayElement.getBoundingClientRect().x;

    // -30は微調整分
    element.scrollLeft += elemtop + -30;
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

    // 今日ボタンの設定
    this.todayButtonSetting();

    // コンテナの描画
    const container = this.createContainer();
    this.drawContainer(container);

    // 日付の描画
    const dates = this.createDates(container);
    this.drawDates(dates)

    // グループの描画
    const groups = this.createGroups(container);
    this.drawGroups(groups);

    // タスクの描画
    const tasks = this.createTasks(groups);
    this.drawTasks(tasks);

    // ツールチップの描画
    this.drawToolChip(tasks);

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
   * 今日ボタンの設定
   */
  private todayButtonSetting() {
    // Todayボタンの表示非表示設定
    document.getElementById('today-button').style.display = 'none';
    document.getElementById(this.chartId).onscroll = () => {
      const todayElement = document.getElementById('today');
      const todayButtonElement = document.getElementById('today-button');
      todayButtonElement.style.display =
        todayElement.getBoundingClientRect().x < 0 ? '' : 'none';
    }
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
    container.append('rect')
      .attr('x', this.config.stroke.width)
      .attr('y', this.config.stroke.width)
      .attr('width', this.config.base.width - this.config.stroke.width * 2)
      .attr('height', this.config.base.height - this.config.stroke.width * 2)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color)
      .attr('fill', 'none');

    container.append('line')
      .attr('x1', 0)
      .attr('x2', this.config.base.width)
      .attr('y1', this.config.yearMonth.height + this.config.dates.height)
      .attr('y2', this.config.yearMonth.height + this.config.dates.height)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', this.config.stroke.color);

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

    const today = moment(new Date('2013-2-12'));
    const todayDate = dates.filter(d => moment(d).diff(today) === 0);
    const holiday = dates.filter(d => moment(d).isoWeekday() === 6 || moment(d).isoWeekday() === 7);

    // 日付線
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

    // 年月
    dates.filter((d, i) => i === 0 || moment(d).date() === 1)
      .append('text')
      .text(d => d3.timeFormat('%Y-%m')(d))
      .attr('x', this.config.dates.width * 0.5)
      .attr('y', this.config.yearMonth.height / 2)
      .attr('font-size', 11)
      .attr('dominant-baseline', 'central');

    // 日付（今日除く）
    dates
      .filter(d => moment(d).diff(today) !== 0)
      .append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.width * 0.5)
      .attr('y', this.config.yearMonth.height + this.config.dates.height / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

    // 休日
    holiday.append('rect')
      .attr('x', 0)
      .attr('y', this.config.yearMonth.height + this.config.dates.height)
      .attr('width', this.config.dates.width)
      .attr('height', dates.node().parentElement.clientHeight)
      .attr('fill', '#f5f5f5');

    // today line
    todayDate
      .append('line')
      .attr('x1', this.config.dates.width / 2)
      .attr('x2', this.config.dates.width / 2)
      .attr('y1', () => this.config.yearMonth.height + this.config.dates.height)
      .attr('y2', dates.node().parentElement.clientHeight)
      .attr('stroke-width', this.config.stroke.width)
      .attr('stroke', '#F9410B')
      .attr('id', 'today');

    // today circle
    todayDate
      .append('circle')
      .attr('cx', this.config.dates.width * 0.5)
      .attr('cy', this.config.yearMonth.height + this.config.dates.height / 2)
      .attr('r', this.config.circle.radius)
      .style('fill', this.config.stroke.todayColor)

    // today text
    todayDate
      .append('text')
      .text(d => d3.timeFormat('%e')(d))
      .attr('x', this.config.dates.width * 0.5)
      .attr('y', this.config.yearMonth.height + this.config.dates.height / 2)
      .attr('font-size', 11)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');
  }

  /**
   * グループの生成
   */
  private createGroups(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Group, SVGSVGElement, unknown> {
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
   * タスクの生成
   */
  private createTasks(
    groups: d3.Selection<SVGGElement, Group, SVGSVGElement, unknown>
  ): d3.Selection<SVGGElement, Task, SVGGElement, Group> {

    return groups
      .selectAll('.tasks')
      .data(d => d.tasks)
      .enter()
      .append('g')
      .attr('class', 'task')
      .attr('transform', d => `translate(${this.config.group.width + this.getTaskLeft(d.startTime)}, ${this.getTaskTopInGroup(d)})`);
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
          width += this.config.dates.width;
        }
        return width;
      })
      .attr('height', this.config.task.height)
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
          width += this.config.dates.width;
        }
        return t.progressRate / 100 * width;
      })
      .attr('height', this.config.task.height)
      .attr('fill', colorScale('inProgress') as string);

    // タスク名
    tasks
      .append('text')
      .text(d => d.name)
      .attr('x', t => {
        let width = 0;
        for (let date = new Date(t.startTime); date <= t.endTime; date = moment(date).add(1, 'days').toDate()) {
          width += this.config.dates.width;
        }
        return width / 2;
      })
      .attr('y', this.config.task.height / 2)
      .attr('fill', '#fff')
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
  }

  /**
   * ツールチップの描画
   */
  private drawToolChip(
    tasks: d3.Selection<SVGGElement, Task, SVGGElement, Group>
  ) {

    // ツールチップ
    tasks.on('mouseover', (event) => {
      const targetElement = event.currentTarget;
      const left = targetElement.getBoundingClientRect().x;
      const top = targetElement.getBoundingClientRect().y;
      const width = targetElement.getBoundingClientRect().width;
      this.showToolTip(top, left, width, targetElement);
    }).on('mouseout', () => {
      this.hideToolTip();
    });

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
   * グループ内でのタスクの上位置の取得
   */
  private getTaskTopInGroup(task: Task) {
    const group = this.groupedTasks.find(g => g.tasks.some(t => t === task));
    let yPoint = this.config.group.paddingTop;
    for (const groupTask of group.tasks) {
      if (groupTask === task) { break; }
      yPoint += this.config.task.height + this.config.task.gap;
    }
    return yPoint;
  }

  /**
   * タスクの左位置の取得
   */
  private getTaskLeft(date: Date): number {
    return this.config.dates.width * (this.config.base.dates as Date[]).findIndex(d => moment(d).isSame(date));
  };

  /**
   * ツールチップの表示
   */
  private showToolTip(
    top: number,
    left: number,
    width: number,
    targetElement: any) {

    const selectedData = d3.select<any, Task>(targetElement).data()[0];

    let tag = 'Task: ' + selectedData.name +
      '<br/>' + 'Starts: ' + moment(selectedData.startTime).format('yyyy/MM/DD') +
      '<br/>' + 'Ends: ' + moment(selectedData.endTime).format('yyyy/MM/DD');
    if (selectedData.details) {
      tag += '<br/>' + 'Details: ' + selectedData.details;
    }

    const output = document.getElementById('tag');
    output.innerHTML = tag;
    output.style.display = 'block';
    const outputWidth = output.getBoundingClientRect().width
    output.style.top = top + this.config.task.height + 10 + 'px';
    output.style.left = left + (width / 2 - outputWidth / 2) + 'px';

    // コンテナー内に収まらない場合は非表示
    if ((Number.parseFloat(output.style.left) + outputWidth) > this.config.container.width) { output.style.display = 'none'; }
  }

  /**
   * ツールチップの非表示
   */
  private hideToolTip() {
    const output = document.getElementById('tag');
    output.style.display = 'none';
  }
}
