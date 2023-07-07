/**
 * Simple performance timer, inspired by the web performance API.
 *
 * Unlike the web performance API, this is not global and supports the creation
 * of child contexts.
 *
 * We also remove marks as soon as they're measured and allow for the elision
 * of marking entirely if you just want to measure the time since instance
 * creation or the last measure call, whichever is sooner.
 *
 * Example:
 *
 * ```
 * const timer = new PerformanceTimer();
 * await someOperation();
 * timer.measure("someOperation"); // will add a measure named "someOperation"
 * await someOperation();
 * timer.measure("someOperation"); // will add another measure named "someOperation"
 * const subTimer = timer.withContext("sub processing");
 * await subOperation();
 * timer.finalize();
 * console.log(timer.toJSON());
 * ```
 *
 * Results in this output:
 * ```
 * {
 *   measures: [
 *     { name: "someOperation", duration: 9168 },
 *     { name: "someOperation", duration: 3480 }
 *   ],
 *   children: {
 *     "sub processing": { measures: [ { name: "total", duration: 6536 } ] }
 *   }
 * } 
 * ```
 **/
export class PerformanceTimer {
  private marks = new Map<string, number>();
  private measures: Array<Measure> = [];
  private start = performance.now();
  private children = new Map<string, PerformanceTimer>();

  constructor() {}

  public withContext(name: string) {
    const child = new PerformanceTimer();
    if (this.children.has(name)) {
      name = `${name}-${this.children.size}`;
    }
    this.children.set(name, child);
    return child;
  }

  public mark(name: string) {
    this.marks.set(name, performance.now());
  }

  public measure(name: string) {
    const start = this.marks.get(name) ?? this.start;

    this.marks.delete(name);

    const now = performance.now();

    this.start = now;

    const duration = now - start;
    this.measures.push({ name, duration });
  }

  public finalize() {
    if (this.measures.length === 0 && this.marks.size === 0) {
      this.measure("total");
    }

    for (const name of this.marks.keys()) {
      this.measure(name);
    }

    for (const child of this.children.values()) {
      child.finalize();
    }
  }

  public toJSON(): JSONMeasures {
    if (this.children.size === 0) {
      return {
        measures: this.measures,
      };
    }

    const children: Record<string, JSONMeasures> = {};
    for (const [name, child] of this.children.entries()) {
      children[name] = child.toJSON();
    }

    return {
      measures: this.measures,
      children,
    };
  }
}

export type JSONMeasures = {
  measures: Array<Measure>;
  children?: Record<string, JSONMeasures>;
};

export type Measure = {
  name: string;
  duration: number;
};
