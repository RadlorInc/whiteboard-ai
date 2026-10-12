 (one line each — this is what the model will be taught)

| Recipe | Line | Draws |
|---|---|---|
| title | `title \| The water cycle` | Blue handwritten title, top-left |
| label | `label x y c=blue s=22 \| text` | A handwritten label |
| leaf | `leaf cx cy length rot=deg` | Leaf: watercolour, shading, veins, sheen, stem |
| sun | `sun cx cy r \| Sunlight` | Sun with 8 rays + label |
| beams | `beams x1 y1 x2 y2` | Three sunlight lines |
| flow | `flow x1 y1 x2 y2 c=blue n=3 dots=1 bend=18 \| Water` | 1–3 curved arrows, optional bubbles, label |
| trail | `trail x1 y1 x2 y2 c=orange k=4 \| Sugar` | Coloured drops along a line + label |
| sea | `sea x1 x2 y` | Sea band with wavy top and wave lines |
| mountain | `mountain cx baseY width height` | Mountain with snow cap and shaded side |
| cloud | `cloud cx cy scale` | Puffy cloud with soft shading |
| rain | `rain x1 y1 x2 y2 \| Precipitation` | Falling drops in a box + label |
| vapour | `vapour x1 x2 yBottom yTop \| Evaporation` | Wavy rising lines with arrowheads + label |
| heart | `heart cx cy size` | Heart: blue right side, red left side, septum, valves, vessels, sheen |
| tool | `tool cx cy length k=stick\|reed\|quill\|pencil\|pen\|stylus rot=-50` | A writing tool, tip along `rot` |
| mark | `mark cx cy k=groove\|wedge\|ink\|graphite\|blue\|glow` | The mark that tool leaves, ~90 wide |

Loops: `loop <id> beat|flow|fall|rise|sway|swing` (swing = rotate about a pivot, e.g. a pendulum).
Journey: `travel <id1,id2,…> <ms> [loop]` — a dot moves along each path; near paths join, far ones fade across.
