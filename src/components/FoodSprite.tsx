import React, { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import type { FoodIcon } from '../lib/recipes';

// Original 16px food sprites, inspired by block-game inventory art.
const sprites: Record<FoodIcon, string[]> = {
  stew: ['................','.....g....g.....','......g..g......','................','...dddddddddd...','..dooooyoooood..','.doyogooogooyod.','.dooooyoooooood.','..dddddddddddd..','..dbbbbbbbbbbd..','...dbbbaabbbd...','....dbbaaabd....','.....dddddd.....','................','................','................'],
  chicken: ['................','......dddd......','....ddoooody....','...dooyyooood...','...doyyyooood...','...doooooobbd...','....dooobbbd....','.....dbbbbd.....','......dddd......','.......ww.......','......ww........','....wwww........','....www.........','................','................','................'],
  beef: ['................','.....dddddd.....','...ddrrrrrrd....','..drrppprrrrd...','..drppprrprrd...','.drrpprrppprrd..','.drrrrrppprrrd..','.drrprrrrrrbbd..','..drppprrbbbd...','...drrrbbbbd....','....ddddddd.....','................','................','................','................','................'],
  fish: ['................','........gg......','......gggg......','....ddddddd.....','...dcccccccd....','..dccwwcccccd...','.dccwwcccckcd.dd','.dccccccccccddcd','..dcccccccccdccd','...dbbbbbbbd.dd.','....ddddddd.....','......gggg......','................','................','................','................'],
  carrot: ['................','.........gg..g..','..........gggg..','.........gggg...','........dddd....','.......doyyod...','......doyyood...','.....dooobbd....','....dooyobd.....','...dooyobd......','..dooobbd.......','..dobbd.........','..ddd...........','................','................','................'],
  bread: ['................','................','.....dddddd.....','...ddyyyyyyd....','..dyywywyyyyd...','.dyywywyyyyyyd..','.dyyyyyyyyyyyd..','.doyyyyyyyyood..','..doooooooood...','...dbbbbbbbd....','....ddddddd.....','................','................','................','................','................'],
};
const palette: Record<string, string> = { d: '#392430', o: '#d78238', y: '#f4c76c', b: '#92512f', a: '#b97844', w: '#fff0cf', g: '#72ab48', r: '#bd5350', p: '#efad91', c: '#67bbba', k: '#171527' };
export const FoodSprite = memo(function FoodSprite({ icon = 'stew', size = 96 }: { icon?: FoodIcon; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 16 16" accessible={false}>{(sprites[icon] ?? sprites.stew).flatMap((row, y) => [...row].map((pixel, x) => pixel === '.' ? null : <Rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[pixel]} />))}</Svg>;
});
