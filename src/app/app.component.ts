import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  w = 800;
  h = 400;
  svg = null;

  taskArray = [
    {
      task: "conceptualize",
      type: "development",
      startTime: "2013-1-28", //year/month/day
      endTime: "2013-2-1",
      details: "This actually didn't take any conceptualization"
    },

    {
      task: "sketch",
      type: "development",
      startTime: "2013-2-1",
      endTime: "2013-2-6",
      details: "No sketching either, really"
    },

    {
      task: "color profiles",
      type: "development",
      startTime: "2013-2-6",
      endTime: "2013-2-9"
    },

    {
      task: "HTML",
      type: "coding",
      startTime: "2013-2-2",
      endTime: "2013-2-6",
      details: "all three lines of it"
    },

    {
      task: "write the JS",
      type: "coding",
      startTime: "2013-2-6",
      endTime: "2013-2-9"
    },

    {
      task: "advertise",
      type: "promotion",
      startTime: "2013-2-9",
      endTime: "2013-2-12",
      details: "This counts, right?"
    },

    {
      task: "spam links",
      type: "promotion",
      startTime: "2013-2-12",
      endTime: "2013-2-14"
    },
    {
      task: "eat",
      type: "celebration",
      startTime: "2013-2-8",
      endTime: "2013-2-13",
      details: "All the things"
    },

    {
      task: "crying",
      type: "celebration",
      startTime: "2013-2-13",
      endTime: "2013-2-16"
    },

  ];

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.svg = d3.selectAll(".svg")
      //.selectAll("svg")
      .append("svg")
      .attr("width", this.w)
      .attr("height", this.h)
      .attr("class", "svg");

              //from this stackexchange question: http://stackoverflow.com/questions/1890203/unique-for-arrays-in-javascript
    const checkUnique = (arr) => {
      var hash = {}, result = [];
      for (var i = 0, l = arr.length; i < l; ++i) {
        if (!hash.hasOwnProperty(arr[i])) { //it works with objects! in FF, at least
          hash[arr[i]] = true;
          result.push(arr[i]);
        }
      }
      return result;
    }

    //from this stackexchange question: http://stackoverflow.com/questions/14227981/count-how-many-strings-in-an-array-have-duplicates-in-the-same-array
    const getCounts = (arr) => {
      var i = arr.length, // var to loop over
        obj = {}; // obj to store results
      while (i) obj[arr[--i]] = (obj[arr[i]] || 0) + 1; // count occurrences
      return obj;
    }

    // get specific from everything
    const getCount = (word, arr) => {
      return getCounts(arr)[word] || 0;
    }

    const makeGrid = (theSidePad, theTopPad, w, h) => {

      var xAxis = d3
        .axisBottom(timeScale)
        .ticks(d3.timeDays, 1)
        .tickSizeInner(-h + theTopPad + 20)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat('%d %b'));

      var grid = this.svg.append('g')
        .attr('class', 'grid')
        .attr('transform', 'translate(' + theSidePad + ', ' + (h - 50) + ')')
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("fill", "#000")
        .attr("stroke", "none")
        .attr("font-size", 10)
        .attr("dy", "1em");
    }
    const drawRects = (theArray, theGap, theTopPad, theSidePad, theBarHeight, theColorScale, w, h) => {

      const bigRects = this.svg.append("g")
        .selectAll("rect")
        .data(theArray)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => {
          return i * theGap + theTopPad - 2;
        })
        .attr("width", (d) => {
          return w - theSidePad / 2;
        })
        .attr("height", theGap)
        .attr("stroke", "none")
        .attr("fill", (d) => {
          for (let i = 0; i < categories.length; i++) {
            if (d.type == categories[i]) {
              return d3.rgb(theColorScale(i));
            }
          }
        })
        .attr("opacity", 0.2);

      const rectangles = this.svg.append('g')
        .selectAll("rect")
        .data(theArray)
        .enter();

      const innerRects = rectangles.append("rect")
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", (d) => {
          return timeScale(dateFormat(d.startTime)) + theSidePad;
        })
        .attr("y", (d, i) => {
          return i * theGap + theTopPad;
        })
        .attr("width", (d) => {
          return (timeScale(dateFormat(d.endTime)) - timeScale(dateFormat(d.startTime)));
        })
        .attr("height", theBarHeight)
        .attr("stroke", "none")
        .attr("fill", (d) => {
          for (let i = 0; i < categories.length; i++) {
            if (d.type == categories[i]) {
              return d3.rgb(theColorScale(i));
            }
          }
        })


      const rectText = rectangles.append("text")
        .text( (d) => d.task)
        .attr("x", (d) => {
          return (timeScale(dateFormat(d.endTime)) - timeScale(dateFormat(d.startTime))) / 2 + timeScale(dateFormat(d.startTime)) + theSidePad;
        })
        .attr("y", (d, i) => i * theGap + 14 + theTopPad)
        .attr("font-size", 11)
        .attr("text-anchor", "middle")
        .attr("text-height", theBarHeight)
        .attr("fill", "#fff");

      rectText.on('mouseover', function (e) {
        // console.log(this.x.animVal.getItem(this));
        var tag = "";

        const selectData: any = d3.select(this).data()[0];
        if (selectData.details != undefined) {
          tag = "Task: " + selectData.task + "<br/>" +
            "Type: " + selectData.type + "<br/>" +
            "Starts: " + selectData.startTime + "<br/>" +
            "Ends: " + selectData.endTime + "<br/>" +
            "Details: " + selectData.details;
        } else {
          tag = "Task: " + selectData.task + "<br/>" +
            "Type: " + selectData.type + "<br/>" +
            "Starts: " + selectData.startTime + "<br/>" +
            "Ends: " + selectData.endTime;
        }
        var output = document.getElementById("tag");

        var x = this.x.animVal.getItem(this) + "px";
        var y = this.y.animVal.getItem(this) + 25 + "px";

        output.innerHTML = tag;
        output.style.top = y;
        output.style.left = x;
        output.style.display = "block";
      }).on('mouseout', function () {
        var output = document.getElementById("tag");
        output.style.display = "none";
      });


      innerRects.on('mouseover', function (e) {
        //console.log(this);
        var tag = "";

        const selectData: any = d3.select(this).data()[0];
        if (selectData.details != undefined) {
          tag = "Task: " + selectData.task + "<br/>" +
            "Type: " + selectData.type + "<br/>" +
            "Starts: " + selectData.startTime + "<br/>" +
            "Ends: " + selectData.endTime + "<br/>" +
            "Details: " + selectData.details;
        } else {
          tag = "Task: " + selectData.task + "<br/>" +
            "Type: " + selectData.type + "<br/>" +
            "Starts: " + selectData.startTime + "<br/>" +
            "Ends: " + selectData.endTime;
        }
        var output = document.getElementById("tag");

        var x = (this.x.animVal.value + this.width.animVal.value / 2) + "px";
        var y = this.y.animVal.value + 25 + "px";

        output.innerHTML = tag;
        output.style.top = y;
        output.style.left = x;
        output.style.display = "block";
      }).on('mouseout', function () {
        var output = document.getElementById("tag");
        output.style.display = "none";

      });
    }

    const vertLabels = (theGap, theTopPad, theSidePad, theBarHeight, theColorScale) => {
      var numOccurances = new Array();
      var prevGap = 0;

      for (var i = 0; i < categories.length; i++) {
        numOccurances[i] = [categories[i], getCount(categories[i], catsUnfiltered)];
      }

      var axisText = this.svg.append("g") //without doing this, impossible to put grid lines behind text
        .selectAll("text")
        .data(numOccurances)
        .enter()
        .append("text")
        .text(function (d) {
          return d[0];
        })
        .attr("x", 10)
        .attr("y", function (d, i) {
          if (i > 0) {
            for (var j = 0; j < i; j++) {
              prevGap += numOccurances[i - 1][1];
              // console.log(prevGap);
              return d[1] * theGap / 2 + prevGap * theGap + theTopPad;
            }
          } else {
            return d[1] * theGap / 2 + theTopPad;
          }
        })
        .attr("font-size", 11)
        .attr("text-anchor", "start")
        .attr("text-height", 14)
        .attr("fill", function (d) {
          for (var i = 0; i < categories.length; i++) {
            if (d[0] == categories[i]) {
              //  console.log("true!");
              return d3.rgb(theColorScale(i)).darker();
            }
          }
        });

    }

    const makeGant = (tasks, pageWidth, pageHeight) => {

      const barHeight = 20;
      const gap = barHeight + 4;
      const topPadding = 75;
      const sidePadding = 75;

      const colorScale = d3.scaleOrdinal()
        .range(['#00B9FA', '#F95002'])

      makeGrid(sidePadding, topPadding, pageWidth, pageHeight);
      drawRects(tasks, gap, topPadding, sidePadding, barHeight, colorScale, pageWidth, pageHeight);
      vertLabels(gap, topPadding, sidePadding, barHeight, colorScale);
    }

    const dateFormat = d3.timeParse("%Y-%m-%d");

    const timeScale = d3.scaleTime()
      .domain([d3.min(this.taskArray, (d) => dateFormat(d.startTime)),
      d3.max(this.taskArray, (d) => dateFormat(d.endTime))])
      .range([0, this.w - 150]);

    let categories = new Array();

    for (let i = 0; i < this.taskArray.length; i++) {
      categories.push(this.taskArray[i].type);
    }

    const catsUnfiltered = categories; //for vert labels

    categories = checkUnique(categories);

    makeGant(this.taskArray, this.w, this.h);

    const title = this.svg.append("text")
      .text("Gantt Chart Process")
      .attr("x", this.w / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", 18)
      .attr("fill", "#009FFC");
  }
}
