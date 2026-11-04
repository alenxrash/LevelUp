import React, { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import type { FoodIcon } from '../lib/recipes';

// Original 16px food sprites, inspired by block-game inventory art.
const sprites: Record<FoodIcon, string[]> = {
  stew: ['................','.....g....g.....','......g..g......','................','...dddddddddd...','..dooooyoooood..','.doyogooogooyod.','.dooooyoooooood.','..dddddddddddd..','..dbbbbbbbbbbd..','...dbbbaabbbd...','....dbbaaabd....','.....dddddd.....','................','................','................'],
  chicken: ['................', '.........ddd....', '.......ddyyod...', '......dyyyyood..', '.....dyyyyooobd.', '.....dyyyooobbd.', '.....dooobbbbbd.', '......dbbbbbbd..', '.......ddbbdd...', '......ww.dd.....', '.....ww.........', '...dwwd.........', '..dwwwd.........', '...ddd..........', '................', '................'],
  beef: ['................', '.....dddddd.....', '...ddrrrrrrdd...', '..drrppprrrrrd..', '.drrpppprrrrprd.', '.drppwppprrpprd.', '.drrpwwprrppprd.', '.drrppwpppprrrd.', '.drrrpppprrrrbd.', '..drrrrrrrrbbd..', '..dbrrrrrbbbbd..', '...dbbbbbbbbd...', '....dddddddd....', '................', '................', '................'],
  fish: ['................','........gg......','......gggg......','....ddddddd.....','...dcccccccd....','..dccwwcccccd...','.dccwwcccckcd.dd','.dccccccccccddcd','..dcccccccccdccd','...dbbbbbbbd.dd.','....ddddddd.....','......gggg......','................','................','................','................'],
  salad: ['................', '......gg........', '...gggGGgg......', '..gGGggGGGgg....', '..gGrrGGyyGg....', '.gGrrrGyyyGGg...', '.gGGrrGGyGrrg...', '..gGGGGGGrGGg...', '.dddddddddddddd.', '..dwwwwwwwwwwd..', '..dcwwwwwwwccd..', '...dccwwwcccd...', '....dccccccd....', '.....dddddd.....', '................', '................'],
  bread: ['................', '................', '.....dddddd.....', '...ddyyyyyydd...', '..dyywwyywwyyd..', '.dyywwyywwyyood.', '.dyyyyyyyyyoood.', '.dyyyyyyyoooobd.', '.doyyyyyoooobbd.', '..doooooooobbd..', '...dbbbbbbbbd...', '....dddddddd....', '................', '................', '................', '................'],
  dessert: ['................', '.......g........', '......rrr.......', '......rrr.......', '....wwwwww......', '...wwwwwwww.....', '..dwwwwwwwwdd...', '..dppppppppod...', '..dyyyyyyyyod...', '..dppppppppod...', '..dyyyyyyyyod...', '..dbbbbbbbbbd...', '...ddddddddd....', '................', '................', '................'],
};
const palette: Record<string, string> = { d: '#392430', o: '#d78238', y: '#f4c76c', b: '#92512f', a: '#b97844', w: '#fff0cf', g: '#477a36', G: '#93c950', r: '#bd5350', p: '#efad91', c: '#67bbba', k: '#171527' };
export const FoodSprite = memo(function FoodSprite({ icon = 'stew', size = 96 }: { icon?: FoodIcon; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 16 16" accessible={false}>{(sprites[icon] ?? sprites.stew).flatMap((row, y) => [...row].map((pixel, x) => pixel === '.' ? null : <Rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[pixel]} />))}</Svg>;
});
