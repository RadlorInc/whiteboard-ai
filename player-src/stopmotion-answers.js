// Stop-motion / paper-motion answers written as recipes: the same kind of short script the model would write.
// Each step = what to say + the scene's colour + which library drawings to put on it (the drawings live in
// stopmotion-topics.html → LIB). Points are x,y on a 960×600 frame; at= starts a drawing late (seconds).
window.SM_ANSWERS = [
{ key: 'plants', q: 'How do plants make food?', steps: [
  { say: 'Plants make their own food, and the kitchen is the leaf.', bg: '#ebe8e2', do: ['glow 520 260 230 #7cc47f', 'ground 560', 'plant'] },
  { say: 'Sunlight gives the leaf its energy.', bg: '#f3e3b0', do: ['glow 200 120 200 #f6d65a', 'ground 560', 'sun 150 110 60', 'beams 210,150 500,230', 'plant glow'] },
  { say: 'Water travels up from the roots.', bg: '#9fc4e6', do: ['glow 480 200 220 #7cc47f', 'soil 420 480', 'stem 480,430 480,120', 'leaf 600 100 .7 -.2', 'flow drop 480,560 480,130 n=5'] },
  { say: 'Carbon dioxide comes in from the air.', bg: '#1d4e5a', do: ['glow 760 200 200 #c9cde6', 'leaf 400 320 1.6', 'pores 300,300 430,260 540,340', 'flow co2 1000,190 420,300 n=6 once gap=.45 spread=70'] },
  { say: "With sunlight's energy, the leaf turns water and carbon dioxide into sugar, its food.", bg: '#9fd29b', do: ['cells', 'flow drop 290,620 470,300 n=4 once gap=.1 dur=2.4 spread=40 size=12', 'flow co2 1000,200 520,300 n=4 once gap=.1 dur=2.4 spread=90', 'flash 490 300 at=1.8', 'sugar 480 300 at=2.6'] },
  { say: 'And it breathes out oxygen, the air we need.', bg: '#9fc4e6', do: ['glow 480 400 200 #7cc47f', 'ground 560', 'plant', 'flow o2 560,220 560,-20 n=6 speed=.3 fade wobble=40'] }] },
{ key: 'water', q: 'What is the water cycle?', steps: [
  { say: 'Water on Earth is always on the move, in a giant loop called the water cycle.', bg: '#cfe3f2', do: ['land flow', 'sun 120 110 50', 'cloud 600 130 .9', 'cycle'] },
  { say: 'The sun warms the sea, and water rises into the air as invisible vapour. That is evaporation.', bg: '#f3d9b8', do: ['zoom 260 330 1.5', 'land', 'sun 140 140 50', 'vapour 40 430 n=9 gap=42'] },
  { say: 'High up, the vapour cools into tiny droplets that gather into clouds. That is condensation.', bg: '#4b6fa8', do: ['glow 480 200 240 #9fc4e6', 'vapour 120 620 n=10 gap=80 h=380', 'cloud 480 200 grow'] },
  { say: 'When the droplets get heavy, they fall as rain or snow. That is precipitation.', bg: '#9fb4d8', do: ['land', 'cloud 700 120 1.1 darken', 'rain 600 820 180 snow=700 at=1'] },
  { say: 'Rivers carry the water back to the sea, and the whole cycle starts again.', bg: '#cfe3f2', do: ['land flow', 'sun 120 110 50', 'cloud 600 130 .9', 'cycle grow at=1'] }] },
{ key: 'heart', q: 'How does the heart pump blood?', steps: [
  { say: 'Your heart is a pump about the size of your fist, and it never stops.', bg: '#4b2f74', do: ['glow 480 300 230 #f07aa0', 'heart 480 300 2.4', 'ring 480 300'] },
  { say: 'Used blood, low on oxygen, comes back from the body into its right side.', bg: '#f3b49b', do: ['heart map', 'blood in'] },
  { say: 'The right side pumps it to the lungs, where it picks up fresh oxygen.', bg: '#f3b49b', do: ['heart map', 'blood in dim', 'blood lungs'] },
  { say: 'Fresh blood comes back from the lungs into the left side.', bg: '#f3b49b', do: ['heart map', 'blood in dim', 'blood lungs dim', 'blood back'] },
  { say: 'And the strong left side pumps it out to the whole body. Two pumps beating together, about seventy times a minute.', bg: '#f3b49b', do: ['heart map', 'blood in dim', 'blood lungs dim', 'blood back dim', 'blood out'] }] },
];
