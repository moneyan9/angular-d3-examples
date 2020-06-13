import { Injectable } from '@angular/core';
import { Group } from '../types/group';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor() { }

  get(): Group[] {
    return [
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
  }
}
