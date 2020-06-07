import { Component, OnInit, ElementRef } from '@angular/core';
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
  selector: 'app-gantt-chart2',
  templateUrl: './gantt-chart2.component.html',
  styleUrls: ['./gantt-chart2.component.scss']
})
export class GanttChart2Component implements OnInit {

  private strokeWidth = 0.5;
  private strokeColor = '#dadada';

  private yearMonthHeight = 20;
  private datesHeight = 20;
  private datesWidth = 28;
  private groupsHeaderWidth = 200;

  private taskHeight = 24;
  private taskGap = 8;
  private groupPaddingTop = 4;
  private groupPaddingBottom = 4;

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
            endTime: new Date('2013-2-16')
          },
        ]
    },
  ];

  constructor(
    private hostElement: ElementRef
  ) { }

  ngOnInit(): void {
    this.drawGanttChart();
  }

  private drawGanttChart() {

    // コンテナの描画
    const styles = getComputedStyle(this.hostElement.nativeElement);
    const container = this.createContainer(styles.width, styles.height);
    this.drawContainer(container);

    // 日付の描画
    const dates = this.createDates(container);
    this.drawDates(dates)

    // グループの描画
    const groups = this.createGroups(container);
    this.drawGroups(groups)

    // タスクの描画
  }

  private createContainer(
    width: string,
    height: string
  ): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
    return d3.selectAll('.gantt-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  }

  private drawContainer(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) {
    container.append('rect')
      .attr('x', this.strokeWidth)
      .attr('y', this.strokeWidth)
      .attr('width', container.node().parentElement.clientWidth - this.strokeWidth * 2)
      .attr('height', container.node().parentElement.clientHeight - this.strokeWidth * 2)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke', this.strokeColor)
      .attr('fill', 'none');

    container.append('line')
      .attr('x1', 0)
      .attr('x2', container.node().parentElement.clientWidth)
      .attr('y1', this.yearMonthHeight + this.datesHeight)
      .attr('y2', this.yearMonthHeight + this.datesHeight)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke', this.strokeColor);

    container.append('line')
      .attr('x1', this.groupsHeaderWidth)
      .attr('x2', this.groupsHeaderWidth)
      .attr('y1', 0)
      .attr('y2', container.node().parentElement.clientHeight)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke', this.strokeColor);
  }

  private createDates(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Date, SVGSVGElement, unknown> {
    const allTasks = this.groupedTasks.reduce((p: Task[], c) => { return [...p, ...c.tasks] }, []);
    const minDate = d3.min(allTasks.map(task => task.startTime));
    const maxDate = d3.max(allTasks.map(task => task.endTime));
    const dates: Date[] = [];
    for (let d = minDate; d < maxDate; d = moment(d).add(1, 'days').toDate()) { dates.push(new Date(d)); }

    return container.selectAll('.dates')
      .data(dates)
      .enter()
      .append('g')
      .attr('class', 'dates')
      .attr('transform', (d, i) => {
        const datesLeft = this.groupsHeaderWidth;
        return `translate(${datesLeft}, 0)`
      });
  }

  private drawDates(
    dates: d3.Selection<SVGGElement, Date, SVGSVGElement, unknown>
  ) {
    dates.append('line')
      .attr('x1', (d, i) => this.datesWidth * (i + 1))
      .attr('x2', (d, i) => this.datesWidth * (i + 1))
      .attr('y1', (d, i, s) => {
        if (i === s.length - 1) {
          return 0;
        } else if (moment(d).date() === moment(d).daysInMonth()) {
          return 0;
        } else {
          return this.yearMonthHeight + this.datesHeight;
        }
      })
      .attr('y2', dates.node().parentElement.clientHeight)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke', this.strokeColor);

    dates.append('text')
      .text(d => d3.timeFormat('%d')(d))
      .attr('x', (d, i) => this.datesWidth * (i + 0.5))
      .attr('y', this.yearMonthHeight + this.datesHeight / 2)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
  }

  private createGroups(
    container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): d3.Selection<SVGGElement, Group, SVGSVGElement, unknown> {
    const getGroupTop = (index: number): number => {
      return this.groupedTasks.reduce((p, c, i) => {
        return p += i <= index ? this.getGroupHeight(c.tasks.length) : 0;
      }, 0);
    };

    return container.selectAll('.groups')
      .data(this.groupedTasks)
      .enter()
      .append('g')
      .attr('class', 'groups')
      .attr('transform', (d, i) => {
        const groupTop = this.yearMonthHeight + this.datesHeight + getGroupTop(i)
        return `translate(0, ${groupTop})`
      });
  }

  private drawGroups(
    groups: d3.Selection<SVGGElement, Group, SVGSVGElement, unknown>
  ) {
    groups.append('line')
      .attr('x1', 0)
      .attr('x2', groups.node().parentElement.clientWidth)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke', this.strokeColor)
  }

  private draTasks(
    groups: d3.Selection<SVGGElement, Group, SVGSVGElement, unknown>
  ) {
  }

  private getGroupHeight(taskLength: number): number {
    return this.taskHeight * taskLength +
      this.taskGap * (taskLength - 1) +
      this.groupPaddingTop + this.groupPaddingBottom;
  };
}
