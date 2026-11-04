/** Logical pixel grid of every room; the character sprite is drawn on the same grid. */
export const SCENE_W = 96;
export const SCENE_H = 100;
export const CHAR_X = 31;
/** Sprite top row; the sprite's feet row (36) lands on y = 78. */
export const CHAR_Y = 42;

export interface SceneRect {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
  o?: number;
}

/** What a scene returns each tick: pieces behind the character and pieces in front of it (held props). */
export interface DynamicLayers {
  back: SceneRect[];
  front: SceneRect[];
}

export class Painter {
  rects: SceneRect[] = [];

  r(x: number, y: number, w: number, h: number, c: string, o?: number) {
    this.rects.push({ x, y, w, h, c, o });
  }

  /** Filled ellipse built from one-pixel rows, so edges stay stair-stepped. */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string, o?: number) {
    for (let dy = -ry; dy <= ry; dy++) {
      const half = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.5)) ** 2));
      this.r(cx - half, cy + dy, half * 2, 1, c, o);
    }
  }

  /** One-pixel line (Bresenham). */
  line(x0: number, y0: number, x1: number, y1: number, c: string, o?: number) {
    let x = x0;
    let y = y0;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.r(x, y, 1, 1, c, o);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /** Draws rows of '#' as filled pixels, for tiny hand-drawn glyphs. */
  art(rows: string[], x: number, y: number, c: string, o?: number) {
    rows.forEach((row, dy) => {
      let dx = 0;
      while (dx < row.length) {
        if (row[dx] !== '#') {
          dx += 1;
          continue;
        }
        let end = dx + 1;
        while (end < row.length && row[end] === '#') end += 1;
        this.r(x + dx, y + dy, end - dx, 1, c, o);
        dx = end;
      }
    });
  }
}
