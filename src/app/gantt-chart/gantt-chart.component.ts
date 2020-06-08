import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

type Task = {
  task: string;
  group: string;
  startTime: string;
  endTime: string;
  details?: string;
}

type ganttSetting = {
  svgWidth: number;
  svgHeight: number;
  titleHeight: number;
  upperLineStrokeWidth: number;
  itemNameWidth: number;
  rightPadding: number;
  leftPadding: number;
  barHeight: number;
  groupPaddingTop: number;
  groupPaddingBottom: number;
  taskGap: number;
}

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss']
})

/**
 * ガントチャート
 */
export class GanttChartComponent implements OnInit, AfterViewInit {

  private tasks: Task[] = [
    {
      task: 'conceptualize',
      group: 'development',
      startTime: '2013-1-28',
      endTime: '2013-2-1',
      details: 'This actually did\'nt take any conceptualization'
    },
    {
      task: 'sketch',
      group: 'development',
      startTime: '2013-2-1',
      endTime: '2013-2-6',
      details: 'No sketching either, really'
    },
    {
      task: 'color profiles',
      group: 'development',
      startTime: '2013-2-6',
      endTime: '2013-2-9'
    },
    {
      task: 'HTML',
      group: 'coding',
      startTime: '2013-2-2',
      endTime: '2013-2-6',
      details: 'all three lines of it'
    },
    {
      task: 'write the JS',
      group: 'coding',
      startTime: '2013-2-6',
      endTime: '2013-2-9'
    },
    {
      task: 'advertise',
      group: 'promotion',
      startTime: '2013-2-9',
      endTime: '2013-2-12',
      details: 'This counts, right?'
    },
    {
      task: 'spam links',
      group: 'promotion',
      startTime: '2013-2-12',
      endTime: '2013-2-14'
    },
    {
      task: 'eat',
      group: 'celebration',
      startTime: '2013-2-8',
      endTime: '2013-2-13',
      details: 'All the things'
    },
    {
      task: 'crying',
      group: 'celebration',
      startTime: '2013-2-13',
      endTime: '2013-2-16'
    },
  ];

  ganttSetting: ganttSetting = null;

  constructor() { }

  /**
   *
   */
  ngOnInit(): void {
  }

  /**
   *
   */
  ngAfterViewInit() {
    this.drawGanttChart();
  }

  /**
   *
   */
  private drawGanttChart() {

    this.ganttSetting = {
      svgWidth: 800,
      svgHeight: 400,
      titleHeight: 75,
      upperLineStrokeWidth: 1,
      itemNameWidth: 100,
      rightPadding: 50,
      leftPadding: 50,
      barHeight: 24,
      groupPaddingTop: 8,
      groupPaddingBottom: 8,
      taskGap: 4,
    }

    const svg = d3.selectAll('.svg')
      .append('svg')
      .attr('width', this.ganttSetting.svgWidth)
      .attr('height', this.ganttSetting.svgHeight);

    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.ganttSetting.svgWidth)
      .attr('height', this.ganttSetting.svgHeight)
      .attr('stroke-width', 1)
      .attr('stroke', '#D3D3D3')
      .attr('fill', 'none')

    const dateFormat = d3.timeParse('%Y-%m-%d');
    const minDate = d3.min(this.tasks, d => dateFormat(d.startTime));
    const maxDate = d3.max(this.tasks, d => dateFormat(d.endTime));
    const scaleTime = d3.scaleTime()
      .domain([minDate, maxDate.setDate(maxDate.getDate())])
      .range([this.ganttSetting.leftPadding + this.ganttSetting.itemNameWidth,
      this.ganttSetting.svgWidth - this.ganttSetting.rightPadding]);
    const scaleColor = d3.scaleOrdinal(d3.schemeCategory10);

    this.drawHeader(svg);
    this.drawGanttUpperLine(svg, scaleTime);
    this.drawDayLines(svg, this.tasks, scaleTime);
    this.drawDayLabel(svg, this.tasks, scaleTime);
    this.drawGanttBottomLine(svg, this.tasks, scaleTime);
    this.drawTodayLine(svg, this.tasks, scaleTime);
    this.drawTasks(svg, this.tasks, dateFormat, scaleTime, scaleColor);
    this.drawGroupNames(svg, this.tasks, scaleColor);
  }

  /**
   *
   */
  private drawHeader(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {

    svg.append('text')
      .text('Gantt Chart Process')
      .attr('x', this.ganttSetting.svgWidth / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('fill', '#009FFC');
  }

  /**
   *
   */
  private drawDayLines(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    tasks: Task[],
    scaleTime: d3.ScaleTime<number, number>
  ) {

    const [startDay, endDay] = scaleTime.domain();
    const rangeDays: Date[] = [];
    while (startDay <= endDay) {
      rangeDays.push(new Date(startDay));
      startDay.setDate(startDay.getDate() + 1);
    }

    svg.append('g')
      .selectAll('line')
      .data(rangeDays)
      .enter()
      .append('line')
      .attr('x1', (d) => scaleTime(d))
      .attr('x2', (d) => scaleTime(d))
      .attr('y1', this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2)
      .attr('y2', this.getGanttHeight(tasks) + this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2)
      .attr('stroke-width', 1)
      .attr('stroke', '#D3D3D3');
  }

  /**
   *
   */
  private drawDayLabel(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    tasks: Task[],
    scaleTime: d3.ScaleTime<number, number>
  ) {

    const [startDay, endDay] = scaleTime.domain();
    const rangeDays: Date[] = [];
    while (startDay <= endDay) {
      rangeDays.push(new Date(startDay));
      startDay.setDate(startDay.getDate() + 1);
    }

    svg.append('g')
      .selectAll('text')
      .data(rangeDays)
      .enter()
      .append('text')
      .text(d => d3.timeFormat('%d')(d))
      .attr('x', (d) => {
        const nextDay = new Date(d).setDate(d.getDate() + 1);
        return (scaleTime(d) + scaleTime(nextDay)) / 2;
      })
      .attr('y', this.ganttSetting.titleHeight - 10)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
  }

  /**
   *
   */
  private drawTodayLine(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    tasks: Task[],
    scaleTime: d3.ScaleTime<number, number>
  ) {

    const toDay = new Date('2013-2-2');
    const nextDay = new Date(toDay).setDate(toDay.getDate() + 1);

    svg.append('g')
      .selectAll('line')
      .data([toDay])
      .enter()
      .append('line')
      .attr('x1', (d) => (scaleTime(d) + scaleTime(nextDay)) / 2)
      .attr('x2', (d) => (scaleTime(d) + scaleTime(nextDay)) / 2)
      .attr('y1', this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2)
      .attr('y2', this.getGanttHeight(tasks) + this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2)
      .attr('stroke-width', 1)
      .attr('stroke', '#EF410B');
  }

  /**
   *
   */
  private drawGanttUpperLine(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    scaleTime: d3.ScaleTime<number, number>
  ) {
    const [startDay, endDay] = scaleTime.domain();

    svg.append('line')
      .attr('x1', scaleTime(startDay) - this.ganttSetting.itemNameWidth)
      .attr('x2', scaleTime(endDay))
      .attr('y1', this.ganttSetting.titleHeight)
      .attr('y2', this.ganttSetting.titleHeight)
      .attr('stroke-width', this.ganttSetting.upperLineStrokeWidth)
      .attr('stroke', '#D3D3D3');
  }

  /**
   *
   */
  private drawGanttBottomLine(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    tasks: Task[],
    scaleTime: d3.ScaleTime<number, number>
  ) {
    const [startDay, endDay] = scaleTime.domain();

    svg.append('line')
      .attr('x1', scaleTime(startDay) - this.ganttSetting.itemNameWidth)
      .attr('x2', scaleTime(endDay))
      .attr('y1', this.getGanttHeight(tasks) + this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2)
      .attr('y2', this.getGanttHeight(tasks) + this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2)
      .attr('stroke-width', 1)
      .attr('stroke', '#D3D3D3');
  }

  /**
   *
   */
  private drawTasks(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    tasks: Task[],
    dateFormat: (dateString: string) => Date,
    scaleTime: d3.ScaleTime<number, number>,
    scaleColor: d3.ScaleOrdinal<string, string>) {

    const groups = this.getGroups(tasks);
    const formatedTasks: { group: string, tasks: Task[] }[] =
      groups.reduce((p, c) => {
        return [...p, { group: c, tasks: tasks.filter(t => t.group === c) }]
      }, []);

    // 背景色
    svg.append('g')
      .selectAll('rect')
      .data(formatedTasks)
      .enter()
      .append('rect')
      .attr('x', this.ganttSetting.leftPadding)
      .attr('y', (d, i) => {
        let yPoint = this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2;
        for (let j = 0; j < i; j++) {
          yPoint += this.getGroupHeight(formatedTasks[j].group, tasks);
        }
        return yPoint;
      })
      .attr('width', d => this.ganttSetting.svgWidth - this.ganttSetting.rightPadding - this.ganttSetting.leftPadding)
      .attr('height', d => this.getGroupHeight(d.group, tasks))
      .attr('stroke', 'none')
      .attr('fill', d => {
        for (let i = 0; i < groups.length; i++) {
          if (d.group === groups[i]) {
            return scaleColor(i.toString());
          }
        }
      })
      .attr('opacity', 0.2);

    const rectangles = svg.append('g')
      .selectAll('rect')
      .data(tasks)
      .enter();

    // 中のタスク
    const innerRects = rectangles.append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', d => scaleTime(dateFormat(d.startTime)))
      .attr('y', (d, i) => this.getTaskYPoint(d, tasks) + this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2)
      .attr('width', d => (scaleTime(dateFormat(d.endTime)) - scaleTime(dateFormat(d.startTime))))
      .attr('height', this.ganttSetting.barHeight)
      .attr('stroke', 'none')
      .attr('fill', d => {
        for (let i = 0; i < groups.length; i++) {
          if (d.group === groups[i]) {
            return scaleColor(i.toString());
          }
        }
      })

    const rectText = rectangles.append('text')
      .text(d => d.task)
      .attr('x', d => {
        return (scaleTime(dateFormat(d.endTime)) - scaleTime(dateFormat(d.startTime))) / 2 +
          scaleTime(dateFormat(d.startTime))
      })
      .attr('y', (d, i) => this.ganttSetting.titleHeight +
        this.getTaskYPoint(d, tasks) +
        this.ganttSetting.barHeight / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#fff');

    // ツールチップ
    rectText.on('mouseover', () => {
      const targetElement = d3.event.currentTarget;
      const left = targetElement.x.animVal.getItem(targetElement) + 'px';
      const top = targetElement.y.animVal.getItem(targetElement) + 30 + 'px';
      this.showToolTip(top, left);
    }).on('mouseout', () => {
      this.hideToolTip();
    });
    innerRects.on('mouseover', () => {
      const targetElement = d3.event.currentTarget;
      const top = targetElement.y.animVal.value + 30 + 'px';
      const left = (targetElement.x.animVal.value + targetElement.width.animVal.value / 2) + 'px';
      this.showToolTip(top, left);
    }).on('mouseout', () => {
      this.hideToolTip();
    });
  }

  /**
   * ツールチップの表示
   */
  private showToolTip(
    top: string,
    left: string) {

    const targetElement = d3.event.currentTarget;
    const selectedData = d3.select(targetElement).data()[0] as Task;

    let tag = 'Task: ' + selectedData.task +
      '<br/>' + 'Type: ' + selectedData.group +
      '<br/>' + 'Starts: ' + selectedData.startTime +
      '<br/>' + 'Ends: ' + selectedData.endTime;
    if (selectedData.details) {
      tag += '<br/>' + 'Details: ' + selectedData.details;
    }

    const output = document.getElementById('tag');
    output.innerHTML = tag;
    output.style.top = top;
    output.style.left = left;
    output.style.display = 'block';
  }

  /**
   * ツールチップの非表示
   */
  private hideToolTip() {
    const output = document.getElementById('tag');
    output.style.display = 'none';
  }

  /**
   *
   */
  private drawGroupNames(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    tasks: Task[],
    scaleColor: d3.ScaleOrdinal<string, string>) {

    const groups = this.getGroups(tasks);
    const formatedTasks: { group: string, tasks: Task[] }[] =
      groups.reduce((p, c) => {
        return [...p, { group: c, tasks: tasks.filter(t => t.group === c) }]
      }, []);

    svg.append('g')
      .selectAll('text')
      .data(formatedTasks)
      .enter()
      .append('text')
      .text(d => d.group)
      .attr('x', this.ganttSetting.leftPadding)
      .attr('y', (d, i) => {
        let yPoint = this.ganttSetting.titleHeight + this.ganttSetting.upperLineStrokeWidth / 2;
        for (let j = 0; j < i; j++) {
          yPoint += this.getGroupHeight(formatedTasks[j].group, tasks);
        }
        return yPoint + this.getGroupHeight(d.group, tasks) / 2;
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .attr('text-height', 14)
      .attr('fill', d => {
        const index = groups.findIndex(c => c === d.group);
        if (index !== -1) {
          return d3.rgb(scaleColor(index.toString())).darker().toString();
        }
      });
  }

  /**
   *
   */
  private getGanttHeight(tasks: Task[]): number {
    const groups = this.getGroups(tasks);
    return groups.reduce((p, c) => p += this.getGroupHeight(c, tasks), 0);
  }

  /**
   *
   */
  private getGroupHeight(group: string, tasks: Task[]) {
    const itemCount = tasks.filter(t => t.group === group).length;
    return this.ganttSetting.groupPaddingTop +
      this.ganttSetting.groupPaddingBottom +
      this.ganttSetting.barHeight * itemCount +
      this.ganttSetting.taskGap * (itemCount - 1);
  }

  /**
   *
   */
  private getTaskYPoint(task: Task, tasks: Task[]): number {
    let yPoint = this.getTaskYPointInGroup(task.group, task.task, tasks);
    const groups = this.getGroups(tasks);
    const formatedTasks: { group: string, order: number, tasks: Task[] }[] =
      groups.reduce((p, c, i) => {
        return [...p, { group: c, order: i, tasks: tasks.filter(t => t.group === c) }]
      }, []);
    const taskOrder = formatedTasks.find(t => t.group === task.group).order;

    for (const formatedTask of formatedTasks) {
      if (formatedTask.order === taskOrder) { break; }
      yPoint += this.getGroupHeight(formatedTask.group, tasks);
    }
    return yPoint;
  }

  /**
   *
   */
  private getTaskYPointInGroup(group: string, task: string, tasks: Task[]) {
    const groupItem = tasks.filter(t => t.group === group);
    let yPoint = this.ganttSetting.groupPaddingTop;
    for (const item of groupItem) {
      if (item.task === task) { break; }
      yPoint += this.ganttSetting.barHeight + this.ganttSetting.taskGap;
    }
    return yPoint;
  }

  private getGroups(tasks: Task[]): string[] {
    return Array.from(new Set(tasks.map(t => t.group)));
  }
}
