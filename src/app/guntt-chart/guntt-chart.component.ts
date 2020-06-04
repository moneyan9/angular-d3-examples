import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

type Task = {
  task: string;
  type: string;
  startTime: string;
  endTime: string;
  details?: string;
}

@Component({
  selector: 'app-guntt-chart',
  templateUrl: './guntt-chart.component.html',
  styleUrls: ['./guntt-chart.component.scss']
})
export class GunttChartComponent implements OnInit, AfterViewInit {

  private tasks = [
    {
      task: 'conceptualize',
      type: 'development',
      startTime: '2013-1-28',
      endTime: '2013-2-1',
      details: 'This actually did\'nt take any conceptualization'
    },
    {
      task: 'sketch',
      type: 'development',
      startTime: '2013-2-1',
      endTime: '2013-2-6',
      details: 'No sketching either, really'
    },
    {
      task: 'color profiles',
      type: 'development',
      startTime: '2013-2-6',
      endTime: '2013-2-9'
    },
    {
      task: 'HTML',
      type: 'coding',
      startTime: '2013-2-2',
      endTime: '2013-2-6',
      details: 'all three lines of it'
    },
    {
      task: 'write the JS',
      type: 'coding',
      startTime: '2013-2-6',
      endTime: '2013-2-9'
    },
    {
      task: 'advertise',
      type: 'promotion',
      startTime: '2013-2-9',
      endTime: '2013-2-12',
      details: 'This counts, right?'
    },
    {
      task: 'spam links',
      type: 'promotion',
      startTime: '2013-2-12',
      endTime: '2013-2-14'
    },
    {
      task: 'eat',
      type: 'celebration',
      startTime: '2013-2-8',
      endTime: '2013-2-13',
      details: 'All the things'
    },
    {
      task: 'crying',
      type: 'celebration',
      startTime: '2013-2-13',
      endTime: '2013-2-16'
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.drawGanttChart();
  }

  private drawGanttChart() {

    const svgWidth = 800;
    const svgHeight = 400;
    const svg = d3.selectAll('.svg')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 800)
      .attr('height', 400)
      .attr('stroke-width', 1)
      .attr('stroke', '#D3D3D3')
      .attr('fill', 'none')

    const dateFormat = d3.timeParse('%Y-%m-%d');
    const minDate = d3.min(this.tasks, d => dateFormat(d.startTime));
    const maxDate = d3.max(this.tasks, d => dateFormat(d.endTime));
    const scaleTime = d3.scaleTime()
      .domain([minDate, maxDate.setDate(maxDate.getDate())])
      .range([0, svgWidth - 150]);
    const scaleColor = d3.scaleOrdinal(d3.schemeCategory10);

    const titleHeight = 75;
    const sidePadding = 75;
    const barHeight = 20;
    const barGap = barHeight + 4;

    this.drawHeader(svg, svgWidth);
    this.drawGanttUpperLine(svg, svgWidth, svgHeight, sidePadding, titleHeight, scaleTime);
    this.drawDayLines(svg, svgWidth, svgHeight, sidePadding, titleHeight, scaleTime);
    this.drawGanttBottomLine(svg, svgWidth, svgHeight, sidePadding, titleHeight, scaleTime);
    this.drawTodayLine(svg, svgWidth, svgHeight, sidePadding, titleHeight, scaleTime);
    // this.drawGrid(svg, svgWidth, svgHeight, sidePadding, titleHeight, scaleTime);
    this.drawRects(svg, svgWidth, svgHeight, sidePadding, titleHeight, barHeight, barGap, this.tasks, dateFormat, scaleTime, scaleColor);
    this.drawVertLabels(svg, sidePadding, titleHeight, barHeight, barGap, this.tasks, scaleColor);
  }

  private drawHeader(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    svgWidth: number) {

    svg.append('text')
      .text('Gantt Chart Process')
      .attr('x', svgWidth / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('fill', '#009FFC');
  }

  private drawGrid(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    svgWidth: number,
    svgHeight: number,
    sidePadding: number,
    titleHeight: number,
    scaleTime: d3.ScaleTime<number, number>) {

    // const adjustTextLabels = selection => {
    //   selection.selectAll('text')
    //     .attr('transform', 'translate(' + daysToPixels(1, scaleTime) / 2 + ',0)');
    // }

    // // calculate the width of the days in the timeScale
    // const daysToPixels = (days, timeScale) => {
    //   const d1 = new Date();
    //   return timeScale(d3.timeDay.offset(d1, days)) - timeScale(d1);
    // }

    // // 年月目盛り
    // const xAxis1 = d3.axisTop(scaleTime)
    //   .ticks(d3.timeDay, 1)
    //   .tickSizeInner(0)
    //   .tickSizeOuter(0)
    //   .tickPadding(20)
    //   .tickFormat((d: Date) => {
    //     if (d.getDate() === 1) {
    //       return d3.timeFormat('%Y/%m')(d).toString();
    //     }
    //     return null;
    //   });

    // // 年月目盛り反映
    // const grid1 = svg.append('g')
    //   .attr('transform', 'translate(' + sidePadding + ', ' + titleHeight + ')')
    //   .call(xAxis1);

    // // 目盛り横線削除
    // grid1.select('.domain').remove();

    // // 日目盛り
    // const xAxis2 = d3.axisTop(scaleTime)
    //   .ticks(d3.timeDay, 1)
    //   .tickSize(-svgHeight + titleHeight + 20)
    //   .tickFormat(d3.timeFormat('%d'))

    // // 反映
    // const grid2 = svg.append('g')
    //   .attr('class', 'grid')
    //   .attr('transform', 'translate(' + sidePadding + ', ' + titleHeight + ')')
    //   .call(xAxis2)
    //   .call(adjustTextLabels);

    // // 目盛り・目盛り線の色の変更
    // grid2.selectAll('.domain').style('color', '#D3D3D3')
    // grid2.selectAll('line').style('color', '#D3D3D3')
    // grid2.selectAll('text').remove();
    // .style('color', 'black')
    // .style('padding-left', '30')
  }

  private drawDayLines(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    svgWidth: number,
    svgHeight: number,
    sidePadding: number,
    titleHeight: number,
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
      .attr('x1', (d) => scaleTime(d) + sidePadding)
      .attr('x2', (d) => scaleTime(d) + sidePadding)
      .attr('y1', titleHeight)
      .attr('y2', 300)
      .attr('stroke-width', 1)
      .attr('stroke', '#D3D3D3');
  }

  private drawTodayLine(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    svgWidth: number,
    svgHeight: number,
    sidePadding: number,
    titleHeight: number,
    scaleTime: d3.ScaleTime<number, number>
  ) {

    const toDay = new Date('2013-2-2');
    const nextDay = new Date(toDay).setDate(toDay.getDate() + 1);

    svg.append('g')
      .selectAll('line')
      .data([toDay])
      .enter()
      .append('line')
      .attr('x1', (d) => (scaleTime(nextDay) + scaleTime(d) + sidePadding * 2) / 2)
      .attr('x2', (d) => (scaleTime(nextDay) + scaleTime(d) + sidePadding * 2) / 2)
      .attr('y1', titleHeight)
      .attr('y2', 300)
      .attr('stroke-width', 1)
      .attr('stroke', '#EF410B');
  }

  private drawGanttUpperLine(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    svgWidth: number,
    svgHeight: number,
    sidePadding: number,
    titleHeight: number,
    scaleTime: d3.ScaleTime<number, number>
  ) {
    const [startDay, endDay] = scaleTime.domain();

    svg.append('line')
      .attr('x1', scaleTime(startDay))
      .attr('x2', scaleTime(endDay) + sidePadding)
      .attr('y1', titleHeight)
      .attr('y2', titleHeight)
      .attr('stroke-width', 1)
      .attr('stroke', '#D3D3D3');
  }

  private drawGanttBottomLine(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    svgWidth: number,
    svgHeight: number,
    sidePadding: number,
    titleHeight: number,
    scaleTime: d3.ScaleTime<number, number>
  ) {
    const [startDay, endDay] = scaleTime.domain();

    svg.append('line')
      .attr('x1', scaleTime(startDay))
      .attr('x2', scaleTime(endDay) + sidePadding)
      .attr('y1', 300)
      .attr('y2', 300)
      .attr('stroke-width', 1)
      .attr('stroke', '#D3D3D3');
  }

  private drawRects(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    svgWidth: number,
    svgHeight: number,
    sidePadding: number,
    titleHeight: number,
    barHeight: number,
    barGap: number,
    tasks: Task[],
    dateFormat: (dateString: string) => Date,
    scaleTime: d3.ScaleTime<number, number>,
    scaleColor: d3.ScaleOrdinal<string, string>) {

    const categories = Array.from(new Set(tasks.map(task => task.type)));

    // 背景色
    svg.append('g')
      .selectAll('rect')
      .data(tasks)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * barGap + titleHeight - 2)
      .attr('width', d => svgWidth - sidePadding / 2)
      .attr('height', barGap)
      .attr('stroke', 'none')
      .attr('fill', d => {
        for (let i = 0; i < categories.length; i++) {
          if (d.type === categories[i]) {
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
      .attr('x', d => scaleTime(dateFormat(d.startTime)) + sidePadding)
      .attr('y', (d, i) => i * barGap + titleHeight)
      .attr('width', d => (scaleTime(dateFormat(d.endTime)) - scaleTime(dateFormat(d.startTime))))
      .attr('height', barHeight)
      .attr('stroke', 'none')
      .attr('fill', d => {
        for (let i = 0; i < categories.length; i++) {
          if (d.type === categories[i]) {
            return scaleColor(i.toString());
          }
        }
      })

    const rectText = rectangles.append('text')
      .text(d => d.task)
      .attr('x', d => {
        return (scaleTime(dateFormat(d.endTime)) - scaleTime(dateFormat(d.startTime))) / 2 +
          scaleTime(dateFormat(d.startTime)) +
          sidePadding
      })
      .attr('y', (d, i) => i * barGap + 14 + titleHeight)
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('text-height', barHeight)
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

  private showToolTip(
    top: string,
    left: string) {

    let tag = '';
    const targetElement = d3.event.currentTarget;

    const selectedData = d3.select(targetElement).data()[0] as Task;
    if (selectedData.details) {
      tag = 'Task: ' + selectedData.task + '<br/>' +
        'Type: ' + selectedData.type + '<br/>' +
        'Starts: ' + selectedData.startTime + '<br/>' +
        'Ends: ' + selectedData.endTime + '<br/>' +
        'Details: ' + selectedData.details;
    } else {
      tag = 'Task: ' + selectedData.task + '<br/>' +
        'Type: ' + selectedData.type + '<br/>' +
        'Starts: ' + selectedData.startTime + '<br/>' +
        'Ends: ' + selectedData.endTime;
    }

    const output = document.getElementById('tag');
    output.innerHTML = tag;
    output.style.top = top;
    output.style.left = left;
    output.style.display = 'block';
  }

  private hideToolTip() {
    const output = document.getElementById('tag');
    output.style.display = 'none';
  }

  private drawVertLabels(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    sidePadding: number,
    titleHeight: number,
    barHeight: number,
    barGap: number,
    tasks: Task[],
    scaleColor: d3.ScaleOrdinal<string, string>) {

    const categories = Array.from(new Set(tasks.map(task => task.type)));
    const numOccurances: { type: string; itemCount: number; }[] =
      categories.reduce((p, c) => {
        return [...p, { type: c, itemCount: tasks.map(task => task.type).filter(x => x === c).length || 0 }]
      }, []);

    // without doing this, impossible to put grid lines behind text
    svg.append('g')
      .selectAll('text')
      .data(numOccurances)
      .enter()
      .append('text')
      .text(d => d.type)
      .attr('x', 10)
      .attr('y', (d, i) => {
        if (i > 0) {
          const prevGap = numOccurances.reduce((p, c, index) => index < i ? p += c.itemCount : p, 0);
          return d.itemCount * barGap / 2 + prevGap * barGap + titleHeight;
        } else {
          return d.itemCount * barGap / 2 + titleHeight;
        }
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'start')
      .attr('text-height', 14)
      .attr('fill', d => {
        const index = categories.findIndex(c => c === d.type);
        if (index !== -1) {
          return d3.rgb(scaleColor(index.toString())).darker().toString();
        }
      });
  }
}
