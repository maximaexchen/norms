import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
 */
@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {
  transform(array: Array<string>, args?: any): Array<string> {
    if (array !== undefined && array !== null && args !== '') {
      console.log('args', array);

      const direction = args === 'desc' ? 1 : -1;
      array.sort((a: any, b: any) => {
        console.log('args', a);

        if (a['lastUpdatedat'] < b['lastUpdatedat']) {
          return -1 * direction;
        } else if (a['lastUpdatedat'] > b['lastUpdatedat']) {
          return 1 * direction;
        } else {
          return 0;
        }
      });
    }
    return array;
  }
}
