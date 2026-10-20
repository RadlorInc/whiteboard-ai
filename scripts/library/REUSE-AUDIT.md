# Drawing library: reuse audit

Founder, 20 Oct 2026: every drawing should stand on its own so any lesson can reuse it, and the model labels it.
Rule now: words a drawing writes itself (part names, captions, titles, written formulas) show by default and
`lab=0` hides them. Marks printed on the real thing stay (N/S, +/−, element symbols, dial and scale numbers,
printed product text). Default renders are pixel-identical to before, so old videos are unchanged.

Types: **object** = one thing; **diagram** = a process, cycle, graph, cutaway or labelled system; **scene** =
several separate things arranged together (listed with the parts that have no drawing of their own).

**861 recipes in 30 categories:** 375 objects, 432 diagrams, 54 scenes; 468 now hide their words with `lab=0`.

## Scenes to split later (parts with no drawing of their own)

| Category | Scene | Missing parts | Note |
|---|---|---|---|
| biogr | `vdj` | IgH germline locus (V/D/J/C segments), clonal selection / B-cell expansion |  |
| biogr | `allosteric` | allosteric enzyme (active vs inactive conformation), sigmoidal vs hyperbolic v–[S] plot |  |
| biouni | `proteinlevels` | amino-acid bead chain (primary), α-helix, β-sheet, tertiary fold, hemoglobin α2β2 tetramer | α/β on subunits kept; N/C termini gated |
| body | `immune` | germ/virus-ball (virus exists, but this spiky germ differs) | already gated by lbl; now lab=0/labels=0 too; antibody and white cell exist in cells |
| cells | `photosynth` | — | sun, beams, leaf are base recipes in recipes.js |
| chemgr | `complexgeom` | — | k=all: four geometry ball-and-stick models (octahedral, square planar, tetrahedral, trigonal bipyramidal) - no standalone recipes for these complexes; isomers: cis/trans square planar and fac/mer octahedral - none standalone |
| chemistry | `beakertherm` | — | beaker + thermometer; both exist standalone (beaker, thermometer) |
| chemistry | `indicator` | — | universal = row of coloured test tubes (testtube exists); litmus = beakers + litmus strips: litmus paper strip has no standalone recipe |
| chemuni | `functionalgroups` | each of the 12 functional-group structures (alkene, alkyne, alcohol, ether, aldehyde, ketone, carboxylic acid, ester, amine, amide, haloalkane, arene) has no standalone recipe | grid of 12 cards |
| computing | `clientserver` | — |  |
| computing | `dnslookup` | — |  |
| computing | `packetroute` | — |  |
| computing | `keypair` | — |  |
| computing | `apicall` | app window (browser/app frame with three dots) |  |
| computing | `cloudsync` | — |  |
| computing | `firewall` | brick wall |  |
| computing | `mltrain` | — |  |
| daily | `room` | window with curtains, bed, desk, chair |  |
| daily | `lunchbox` | sandwich |  |
| earth | `glacier` | mountain, iceberg |  |
| earth | `dune` | — |  |
| earth | `rainforest` | vine, tropical (rainforest) tree |  |
| economy | `mobilepay` | card reader / payment terminal |  |
| economy | `scarcity` | raised hand/arm, shelf | apples = fruit k=apple |
| economy | `insurance` | raindrops/rain | umbrella exists (daily umbrella), house = building k=house; nothing gated |
| economy | `crowdfund` | progress/funding bar | people = person/people, coins = coin |
| engineering | `biomass` | log pile, crop sheaf | power plant has powerplant, tree has tree |
| engineering | `batterybank` | grid battery container | pylon: powerline; draws no words of its own (only caller text); unchanged |
| engineering | `irrigation` | irrigation canal / crop rows | river exists; draws no words of its own (only caller text); unchanged |
| engineering | `junction` | zebra crossing | car exists; draws no words of its own (only caller text); unchanged |
| engineering | `roundabout` | — | car exists; road layout is the drawing itself; draws no words of its own (only caller text); unchanged |
| engineering | `railsignal` | semaphore signal | track exists; draws no words of its own (only caller text); unchanged |
| engineering | `runway` | runway strip, airport terminal | airplane exists; runway numbers 09/27 kept (painted on the runway); draws no words of its own (only caller text); unchanged |
| engineering | `heatpump` | outdoor heat-pump unit | house is a private helper, no standalone house recipe (building exists); draws no words of its own (only caller text); unchanged |
| engineering | `deforest` | tree stump, log pile | tree exists; draws no words of its own (only caller text); unchanged |
| engineering | `oceanplastic` | plastic bottle, plastic bag, sea turtle | fish: seacreature; draws no words of its own (only caller text); unchanged |
| engineering | `smog` | smog haze | skyline, factory, car exist; draws no words of its own (only caller text); unchanged |
| engineering | `evpetrol` | petrol pump | car, evcharge exist; had labels= gating already (on by default, unchanged); lab=0 now also hides |
| history | `cavefire` | cave, campfire, cave painting |  |
| history | `ploughfield` | plough, ploughed field |  |
| history | `telegraph` | telegraph pole, telegraph key |  |
| history | `inventbulb` | workbench, battery jar |  |
| history | `lander` | lunar lander, moon surface |  |
| history | `march` | protest sign | default slogans kept: text on the signs |
| history | `caravan` | — |  |
| life | `habitat` | savanna/acacia tree, conifer tree, seaweed, ice floe, sun (base recipe only) | background scene; cactus and mushroom exist; no own words |
| life | `kingdoms` | generic small animal (pig-like), small flowering plant (plant helper) | kingdom titles newly gated; mushroom/protist/bacterium exist |
| phys | `symbols` | battery symbol, lamp symbol, switch symbol (switch recipe is a pictorial knife switch), variable resistor, ammeter, voltmeter, diode, LED symbol (led is pictorial), fuse symbol, earth symbol | chart of circuit symbols |
| tech | `evcharge` | charging post (no standalone charger recipe; engineering evpetrol is itself a scene) | car = vehicle k=car |
| world | `pond` | lily pad, reeds |  |
| world | `people` | — |  |
| world | `courtroom` | judge, judge bench, table |  |
| world | `classroom` | school desk, seated pupil | board text kept: it is writing on the object |
| world | `stall` | fruit crate, striped awning |  |

## Every recipe

### anatomy (3)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `heartcut` | object | — | — | draws no words; parts named only via pin |
| `sv` | object | — | — | loads on-demand drawings; no words |
| `pin` | object | — | part name from part= (or |text) | a pin IS a label pointer; its words come from the caller part=/text, so not gated. No change; no lab=0 added |

### biogr (27)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `aminoacid` | object | H₂O, H₂N, C, R₁, H, O, OH, N, R₂, condensation (dehydration), peptide bond (C–N amide), + H₂O, N-terminus, C-terminus, R, α, amino group, carboxyl group, side c | t (caller text) | sequence letters / atom symbols kept |
| `foldfunnel` | diagram | unfolded states, native state N (lowest G), kinetic trap, (misfolded), local minimum, (partly folded), free energy (G), conformational entropy (width = number o | t (caller text) |  |
| `ramachandran` | diagram | −, φ (degrees), ψ (degrees), β-sheet, right-handed α-helix (αR), left-handed helix (αL), favoured, allowed, white:, steric clash | t (caller text) |  |
| `cryoem` | diagram |  Z, X-rays, 1 protein crystal, 2 diffraction, pattern (intensities), 3 electron, density map, 4 atomic model, phases (molecular replacement, SAD/MAD) + Fourier  | t (caller text) |  |
| `alignment` | diagram | GCATG, GATG, −, F(i, j) = max of, F(i−1, j−1) + s(match / mismatch), F(i−1, j) − 1   (gap), F(i, j−1) − 1   (gap), match +1, mismatch −1, gap −1, Needleman–Wuns | −, |, ×, t (caller text) | sequence letters / atom symbols kept |
| `phylotree` | diagram | mouse, rat, rabbit, chicken, lizard, frog, zebrafish, 0.1 substitutions/site, unrooted: no ancestor or time direction, red = bootstrap support (%),  (outgroup), | t (caller text) |  |
| `genenetwork` | diagram | feedforward, activation, repression, X, Y, activates, represses, negative feedback loop (e.g. p53 → Mdm2 ⊣ p53), level, time, delayed negative feedback → pulses | t (caller text) |  |
| `mapk` | diagram | extracellular, cytoplasm, growth factor, RTK, dimer, Grb2, SOS, Ras-GTP, GDP → GTP, Raf, MAPKKK, MEK, MAPKK, ERK, MAPK, Elk-1, target genes on (e.g. c-fos), nuc | t (caller text) |  |
| `wnt` | diagram | nucleus, target genes, β-cat, signal-sending cell, signal-receiving cell, Delta, Notch, S2: ADAM10 cleaves, S3: γ-secretase cleaves, NICD, CSL, MAML, Hes / Hey  | t (caller text) |  |
| `rtk` | diagram | ATP → ADP, SH2, Grb2, Ras–MAPK, 1 ligand binds, monomers, 2 dimerization, 3 trans-auto-, phosphorylation, 4 SH2 adaptor, docks on pY, extracellular, cytoplasm | Y, t (caller text) |  |
| `cyclins` | diagram | G1, G2, cyclin D + CDK4/6, cyclin E + CDK2, cyclin A + CDK2/1, cyclin B + CDK1, G1/S checkpoint, G2/M checkpoint, spindle checkpoint, cyclin level, APC/C destro | t (caller text) |  |
| `methylation` | diagram | TACGGATCGCTACG, T, A, G, C, DNMT methylates C in CpG → 5-methylcytosine (symmetric on both strands), euchromatin (open, active), acetylated tails (H3K27ac), H3K | 5′, 3′, CH₃, t (caller text) | sequence letters / atom symbols kept |
| `splicing` | diagram | exon 1, exon 2, exon 3, 5′ cap, poly(A), exon inclusion, exon skipping, mRNA isoform A, mRNA isoform B, protein isoform A, protein isoform B (lacks exon 2 domai | AAAA, GU, A, AG, t (caller text) | sequence letters / atom symbols kept |
| `rnai` | diagram | nucleus, pri-miRNA, Drosha·DGCR8, pre-miRNA, Exportin-5, long dsRNA (virus or experimental), Dicer, 21–23-nt duplex (2-nt 3′ overhangs), RISC (Argonaute + guide | AAA, t (caller text) |  |
| `ngsflow` | diagram | clusters, ACGT, cycle 1, 2, 3 …, read, ACGTTACCGATGCA, reference, 1 fragment DNA, 2 ligate adapters, 3 cluster amplification, bridge PCR on the flow cell, 4 seq | CATGGA, T, t (caller text) | sequence letters / atom symbols kept |
| `flowcytometry` | diagram | plot, %, CD4⁻CD8⁺ , CD4⁺CD8⁻ , double +, double −, CD4 (FITC fluorescence), CD8 (PE fluorescence), gated on CD3⁺ lymphocytes, sheath fluid, sample (cells), hydr | ⁰¹²³⁴, t (caller text) |  |
| `vdj` | scene | V1, V2, V3, …, Vn, Cμ, Cδ, V (~40), D (~23), J (6), C, germline DNA (IgH locus), RAG1/RAG2 cut at RSSs (12/23 rule), D–J, then V–DJ joining (NHEJ), VDJ exon, re | t (caller text) |  |
| `nernst` | diagram | outside, inside, Na⁺, Cl⁻, K⁺, A⁻, ion, out (mM), in (mM), E_{ion}, −, +,  mV, at 37 °C, mammalian neuron, Nernst equation (one ion at equilibrium):, E_{ion} =  | + + + + + + + + + +, − − − − − − − − − −, t (caller text) | ion particles and +/− membrane charges kept; ion table and equations gated |
| `channelgating` | diagram | outside, inside, Na⁺ in, activation gate, inactivation gate, (ball and chain), S4 (+), closed (resting), V_{m} ≈ −70 mV, open (activated), depolarized past ≈ −5 | +, Na⁺, t (caller text) |  |
| `ltp` | diagram | presynaptic, AMPA, NMDA, Na⁺, Mg²⁺ blocks, resting ≈ −70 mV, before: basal transmission, glutamate opens AMPA only, small EPSP, Ca²⁺, CaMKII, after LTP (high-fr | t (caller text) |  |
| `morphogen` | diagram |  L200 40 L-200 40 Z, T₁, T₂, fate 1, (C > T₁), fate 2, (T₂ < C < T₁), fate 3, (C < T₂), source, morphogen concentration C, position x (anterior → posterior), C( | t (caller text) |  |
| `allosteric` | scene | active site, allosteric site, activator bound → active form, inhibitor bound → inactive form, active site closed, [S], v, Vmax, hyperbolic (Michaelis–Menten), s | A, I, t (caller text) |  |
| `metabolicmap` | diagram | mitochondrion, cytosol, glycolysis, → 2 ATP, 2 NADH, gluconeogenesis, (via OAA, PEP), PDH (− CO₂), citric acid, cycle, NADH, FADH₂, ATP, O₂ → H₂O, fatty acyl-Co | t (caller text) |  |
| `geneticdrift` | diagram | small population (N = 10), large population (N = 2000), generation, fixed, lost, allele frequency p, drift is strongest when N is small: Var(Δp) = p(1 − p) / 2N | t (caller text) |  |
| `lotkavolterra` | diagram | dN/dt = αN − βNP, dP/dt = δNP − γP, prey N, predator P, dP/dt = 0, dN/dt = 0, (γ/δ, α/β), closed orbits: neutral cycles around the equilibrium, time, population | t (caller text) |  |
| `quorum` | diagram | low cell density, autoinducer below threshold, lux genes off: no light, high cell density, autoinducer above threshold, LuxR–AHL turns on luxCDABE: light, autoi | t (caller text) |  |
| `qpcrcurve` | diagram | 10⁶, 10⁵, 10⁴, 10³, fluorescence (ΔRn), cycle number, threshold, NTC, Ct:,  copies, starting template:, baseline, exponential phase, plateau, ΔCt ≈ 3.3 cycles p | t (caller text) |  |

### biology (9)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `heartsection` | diagram | vena cava, right atrium, right ventricle, to lungs, aorta, from lungs, left atrium, left ventricle, septum (wall) | — | already gated by lab; now labels=0 too |
| `circulation` | diagram | RA, LA, RV, LV, lungs: blood picks up oxygen, body: oxygen is used, to lungs, from lungs, from body, to body, heart | — | chamber letters RA/LA/RV/LV newly gated |
| `breathing` | diagram | nose and mouth, windpipe (trachea), bronchus, lung, ribs, diaphragm, alveoli (air sacs) | — | embeds lungs/alveolus with lbl=0 |
| `gut` | diagram | mouth, food pipe (gullet), liver, stomach, pancreas, small intestine, large intestine, rectum | — |  |
| `reflexarc` | diagram | heat, receptor in skin, sensory neuron, spinal cord, relay neuron, motor neuron, muscle (effector) | — | flame, fingertip and spinal-cord section have no standalone recipe |
| `dnaladder` | diagram | backbone: sugar + phosphate, base pair, hydrogen bonds hold the pairs, A pairs with T, G pairs with C | A, T, G, C (base letters on the rungs) |  |
| `cellcycle` | diagram | interphase, prophase, metaphase, anaphase, telophase, 2 new cells, step numbers 1-6 | — |  |
| `leafsection` | diagram | light, CO₂ in, O₂ + water out, waxy cuticle, upper epidermis, palisade layer (most chloroplasts), spongy layer + air spaces, vein: xylem + phloem, lower epiderm | — |  |
| `plantparts` | diagram | flower, bud, leaf, stem, roots, root hairs, soil | — |  |

### biouni (17)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `michaelis` | diagram | competitive inhibitor: Km ↑, Vmax same, noncompetitive inhibitor: Vmax ↓, Km same, 1/[S], 1/v₀, −1/Km, 1/Vmax, slope = Km/Vmax, + inhibitor, 1/v₀ = (Km/Vmax)(1/ | t (caller text) |  |
| `lightreactions` | diagram | PSII, b6f, PSI, light, H₂O → ½O₂ + 2H⁺, Pq, Pc, Fd, e⁻, NADP⁺ + H⁺ → NADPH, H⁺, ADP + Pᵢ → ATP, stroma, thylakoid lumen (high H⁺), thylakoid, membrane, ATP, syn | H⁺, t (caller text) |  |
| `calvin` | diagram | 3 RuBP, 6 3-PGA, 6 G3P, 5 G3P, 3 CO₂, rubisco, 6 ATP, 6 ADP, 6 NADPH, 6 NADP⁺, 3 ATP, 3 ADP, 1 G3P out, → glucose, sugars, ① fixation, ② reduction, ③ regenerati | t (caller text) |  |
| `glycolysis` | diagram | glucose, G6P, F6P, F1,6BP, 2 G3P, 2 1,3-BPG, 2 3-PG, 2 2-PG, 2 PEP, 2 pyruvate, ATP, ADP, 2 NAD⁺, 2 NADH, 2 ADP, 2 ATP, hexokinase, PFK-1, aldolase, pyruvate ki | t (caller text) |  |
| `krebs` | diagram | citrate, isocitrate, α-ketoglutarate, succinyl-CoA, succinate, fumarate, malate, oxaloacetate, NADH, CO₂, GTP (→ ATP), FADH₂, acetyl-CoA (2C), citric acid cycle | t (caller text) |  |
| `atpsynthase` | diagram | F₁ head (α₃β₃), rotates, ADP + Pᵢ, ATP, intermembrane space (high H⁺), inner membrane, matrix (low H⁺), stator (a), F₀ rotor (c ring), stalk | H⁺, t (caller text) |  |
| `codon` | diagram | second base, 1st, 3rd, mRNA codons read 5′ → 3′; green = start, red = stop | t (caller text), UCAG, FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG, Phe, Leu, S | codon letters, codons and amino-acid names are the table content: kept |
| `operon` | diagram | lacI, P, O, lacZ, lacY, lacA, promoter, operator, regulatory gene, repressor made, repressor, RNA pol, no lactose: repressor binds, operator, blocks RNA polymer | t (caller text) |  |
| `pedigree` | diagram | Ma, Fu, Fa, Mu, Mc, Fc, Fx, affected, unaffected, carrier, □ male  ○ female, autosomal dominant, every generation; affected father → affected son, autosomal rec | I, II, III, t (caller text) | generation numerals and individual numbers kept as pedigree marks |
| `hardyweinberg` | diagram | genotype frequency, allele frequency p (of A);  q = 1 − p, AA = p², aa = q², Aa = 2pq, p² + 2pq + q² = 1, p + q = 1 | t (caller text) |  |
| `pcrcycle` | diagram | denature, anneal, extend, ↑  ↓, Taq polymerase, primers bind, strands separate, copies double each cycle: 1 → 2 → 4 → 8 … 2ⁿ after n cycles, time, °C, one cycle | t (caller text) |  |
| `speciation` | diagram | river (barrier), one population, subgroup diverges, in the same area, two species, no physical barrier, barrier splits it:, no gene flow, reproductively isolate | t (caller text) |  |
| `popgrowth` | diagram | time, population size N, K, carrying capacity, exponential (J), dN/dt = rN, logistic (S), dN/dt = rN (K − N)/K | t (caller text) |  |
| `actionpotential` | diagram | time (ms), membrane potential (mV), resting, threshold, depolarization, Na⁺ in, repolarization, K⁺ out, hyperpolarization | −55, −70, +30, t (caller text) |  |
| `o2curve` | diagram | % O₂ saturation of hemoglobin, pO₂ (mmHg), P₅₀ ≈ 26, right shift (Bohr effect):, ↑CO₂, ↑H⁺ (↓pH), ↑temperature, normal, tissues, lungs | t (caller text) |  |
| `proteinlevels` | scene | N, C,  L, α-helix, β-sheet, S–S, e.g. hemoglobin, (2 α + 2 β), primary, amino acid sequence, secondary, H-bonds in backbone, tertiary, 3-D fold of one chain, qu | α, β, t (caller text) | α/β on subunits kept; N/C termini gated |
| `elisa` | diagram | gel, membrane, 1° antibody, 2° + enzyme, kDa, gel electrophoresis, SDS-PAGE: size, transfer, blot onto membrane, antibody probe, binds target protein, detection | −, +, t (caller text) |  |

### body (35)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `torso` | object | — | — |  |
| `lungs` | object | windpipe | — | already gated by lbl; now lab=0/labels=0 too |
| `alveolus` | diagram | O₂ in, CO₂ out, bronchiole | — | already gated by lbl; now lab=0/labels=0 too (gate also hides the in/out arrows, as before) |
| `brain` | object | frontal, parietal, temporal, occip. | — | already gated by lbl; now lab=0/labels=0 too |
| `neuron` | object | cell body, axon | — | already gated by lbl; now lab=0/labels=0 too |
| `synapse` | diagram | gap | — | already gated by lbl; now lab=0/labels=0 too |
| `kidney` | object | artery, vein, ureter, cortex, pyramid | — | already gated by lbl; now lab=0/labels=0 too |
| `nephron` | diagram | glomerulus, tubule, loop of Henle, collecting, duct, urine ↓ | — | already gated by lbl; now lab=0/labels=0 too |
| `liver` | object | — | — |  |
| `stomach` | object | — | — |  |
| `intestines` | object | large, small (inside) | — | already gated by lbl; now lab=0/labels=0 too |
| `digestive` | diagram | — | — | no words |
| `pancreas` | object | — | — |  |
| `skeleton` | object | — | — |  |
| `skull` | object | — | — |  |
| `bone` | object | compact bone, marrow, spongy | — | already gated by lbl; now lab=0/labels=0 too |
| `joint` | object | cartilage, thigh bone, shin bone | — | already gated by lbl; now lab=0/labels=0 too |
| `muscle` | object | biceps bulges, biceps long and relaxed, shoulder, elbow, forearm | — | already gated by lbl; now lab=0/labels=0 too |
| `eye` | object | cornea, lens, retina, nerve | — | already gated by lbl; now lab=0/labels=0 too |
| `ear` | object | outer ear, canal, eardrum, ear bones, cochlea, nerve | — | already gated by lbl; now lab=0/labels=0 too |
| `nose` | diagram | smell receptors, brain, nasal cavity, scent | — | already gated by lbl; now lab=0/labels=0 too |
| `tooth` | object | enamel, dentin, pulp, gum | — | already gated by lbl; now lab=0/labels=0 too |
| `skin` | object | epidermis, dermis, fat, hair root, sweat gland | — | already gated by lbl; now lab=0/labels=0 too |
| `vessel` | object | artery: thick wall, vein: thin wall, valves, capillary: one cell thin | — | already gated by lbl; now lab=0/labels=0 too |
| `bloodcell` | object | — | — |  |
| `blooddrop` | object | plasma, red cells, white cell, platelets | — | already gated by lbl; now lab=0/labels=0 too |
| `bloodtube` | object | plasma 55%, white cells, platelets, red cells 45% | — | already gated by lbl; now lab=0/labels=0 too |
| `immune` | scene | germ, antibodies | — | already gated by lbl; now lab=0/labels=0 too; antibody and white cell exist in cells |
| `gland` | object | hormones (default) | |text caption | was lbl-gated even for |text; now |text always shows |
| `ecg` | diagram | — | |text title |  |
| `feverthermo` | object | 39 °C / 37 °C reading caption | — | already gated by lbl; now lab=0/labels=0 too |
| `pill` | object | — | — |  |
| `syringe` | object | — | — |  |
| `stethoscope` | object | — | — |  |
| `bandage` | object | — | — |  |

### calculus (32)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `normal` | diagram | P(a < X < b) = p ≈ %, default "mean μ = …, standard deviation σ = …" | tick values, μ and kσ marks, caller label |  |
| `histogram` | diagram | default y title "frequency", default "n = …, bin width …" | counts, bin edges, xl/yl options, caller label |  |
| `boxplot` | diagram | min, Q1, median, Q3, max names, "n = · IQR = … · outliers" line | five-number values, ticks, caller label |  |
| `dotplot` | diagram | "n · mean · median · mode" line | ticks, caller label |  |
| `stemleaf` | diagram | "stem", "leaf" headings, "key: … · n = …" line | stems and leaf digits, caller label |  |
| `cumfreq` | diagram | default y title "cumulative frequency", "median ≈ v", "Q1 ≈", "Q3 ≈" marks, info block (n, "median at … →", IQR) | ticks, xl/yl options, caller label |  |
| `correl` | diagram | info block (r = …, strong/weak positive/negative, best fit equation) | ticks, xl/yl, caller label |  |
| `probtree` | diagram | outcome products column ("Red, Red: 3/5 × 2/4 = 3/10") | branch names and probabilities from caller text |  |
| `samplespace` | diagram | "second die →", "first die ↓", default "P(sum = 7) = n/36" (when no |label) | operator symbol, die numbers, cell results, caller label |  |
| `zscore` | diagram | working line "z = (x − μ) ÷ σ = …", default "% of values lie below …" | x and z scale numbers, x and z axis letters, x = …, z = … point marks, caller label |  |
| `confint` | diagram | "95% confidence interval: … ± … = (…)", "margin = z* × σ ÷ √n = …", word "true" in "true μ =" | ticks, interval ends and mean, μ = value, caller label |  |
| `unitcircle` | diagram | "cos θ", "sin θ" segment names, values panel (θ = …, cos θ = …, sin θ = …, tan θ = …) | ±1 ticks, x, y, θ, point coordinates, caller label |  |
| `trigtri` | diagram | words adjacent/opposite/hypotenuse, "SOH CAH TOA", sin/cos/tan ratio lines | side lengths, angle degrees, caller label | lab=0 sides show numbers only |
| `trigwave` | diagram | "amplitude", "period", "midline" words, default equation "y = a sin(…)" (when no |label) | π ticks, amplitude/period values, y = d midline value, x, y axis letters, caller label |  |
| `tangent` | diagram | info block (f(x) = …, slope f′(a) = …, tangent: y = …) | point coordinates, ticks, caller label |  |
| `secant` | diagram | info block (f(x) = …, "h = …: slope …", "h → 0: slope → f′(a)") | ticks, caller label |  |
| `riemann` | diagram | info block (f(x) = …, "left sum, n = …", exact ∫ … = …) | ticks, caller label |  |
| `integral` | diagram | info block (f(x), g(x), ∫ … dx = …, total area) | ticks, caller label |  |
| `slopefield` | diagram | default "dy/dx = …" (when no |label) | ticks, caller label |  |
| `derivplot` | diagram | "max x = …"/"min x = …" marks, default "f(x) = …" (when no |label), "f′(x): the slope of f", "f′ = 0 where f turns" | f(x), f′(x), x axis titles, ticks, caller label |  |
| `limit` | diagram | info block (f(x) = …, values near a, lim …, "from the left/right", "so the limit does not exist", f(a)) | ticks, caller label |  |
| `piecewise` | diagram | info block ("f(x) =" and each piece "expr if lo ≤ x < hi") | ticks, caller label |  |
| `asymptote` | diagram | info block (f(x) = …, vertical/horizontal/slant, hole at …) | x = r and y = c asymptote marks, ticks, caller label |  |
| `growth` | diagram | "A passes B at x ≈ …" | curve names (caller or formulas), x, y axis letters, ticks |  |
| `logscale` | diagram | "each equal step multiplies by 10" | powers of ten, ×10 marks, value names from caller and values |  |
| `sequence` | diagram | info block ("arithmetic/geometric sequence", nth-term rule, common difference/ratio, Sₙ) | term values, n and aₙ axis letters, caller label |  |
| `sigma` | object | default caption "add f for k = a to b (n terms)" (when no |label) | Σ card (limits, term), expansion and total, caller label |  |
| `axes3d` | diagram | "|OP| = √(…) = …" length line | x, y, z, ticks, point names and coordinates |  |
| `complex` | diagram | info block (|z| = …, θ = …°) | Re, Im axis titles, θ, z = a + bi and conjugate marks, names from caller |  |
| `polar` | diagram | default equation "r = …" (when no |label), shape note ("rose: 3 petals", "cardioid (heart shape)", …) | radius ticks, angle ticks, caller label |  |
| `conic` | diagram | "directrix" word, info block (equation, foci distance, eccentricity, asymptote slope) | F₁, F₂, F with coordinates, r = a, y = … directrix value, x, y, caller label (block keeps it) |  |
| `transform` | diagram | rule block ("translation/reflection in …/rotation/dilation", mapping rule) | point names and coordinates, ticks |  |

### carfix (17)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `car` | object | — | — |  |
| `lugwrench` | object | — | — |  |
| `lugorder` | diagram | — | 1-5 order |  |
| `warntriangle` | object | — | — |  |
| `enginebay` | diagram | — | — |  |
| `dipstick` | object | MIN, MAX | — |  |
| `oildrain` | diagram | — | — |  |
| `oilfilter` | object | — | OIL FILTER |  |
| `oilbottle` | object | — | OIL, 5W-30 |  |
| `jumpstart` | diagram | DEAD, GOOD, bare metal | +, −, 1-4 order | the batteries are also a standalone carbattery |
| `treaddepth` | diagram | wear bar | 2/32" / 8/32" gauge reading | "good"/"replace" removed (advice) |
| `wiper` | object | — | — |  |
| `dashlight` | object | — | — |  |
| `airfilter` | object | — | — |  |
| `fusebox` | object | — | amp numbers |  |
| `gearstick` | object | clutch, brake, gas | 1-5, R, P R N D |  |
| `muffler` | diagram | engine, catalytic converter, muffler | — |  |

### cells (32)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `animalcell` | object | Nucleus, Membrane, Mitochondrion, ER, Golgi, Cytoplasm | — | opt-in lab=1 (default hidden, unchanged); was buggy: lab=0 SHOWED words (truthy "0"); now lab=0/labels=0 hide |
| `plantcell` | object | Cell wall, Membrane, Vacuole, Chloroplast, Nucleus | — | same opt-in lab=1 fix as animalcell |
| `mitochondrion` | object | — | — |  |
| `chloroplast` | object | — | — |  |
| `cellnucleus` | object | — | |text caption |  |
| `golgi` | object | — | |text caption |  |
| `ribosome` | object | — | |text caption |  |
| `cellmembrane` | object | — | |text caption |  |
| `dna` | object | — | |text caption |  |
| `chromosome` | object | — | |text caption |  |
| `gene` | object | Gene (default when no |text) | |text brace label |  |
| `rna` | object | — | A U G C base letters, |text caption |  |
| `protein` | object | — | |text caption |  |
| `mitosis` | object | — | |text caption |  |
| `meiosis` | diagram | — | |text caption |  |
| `bacterium` | object | — | — |  |
| `virus` | object | — | |text caption |  |
| `antibody` | object | — | |text caption |  |
| `phagocyte` | object | — | |text caption |  |
| `enzyme` | diagram | Enzyme, Substrate | |text caption | opt-in lab=1; fixed lab=0 |
| `microscope` | object | — | — |  |
| `petridish` | object | — | |text caption |  |
| `rootsystem` | object | — | |text caption |  |
| `stemcut` | object | Phloem, Xylem, Pith, Epidermis | |text caption | opt-in lab=1; fixed lab=0 |
| `flowerparts` | object | Petal, Stamen, Stigma, Ovary, Sepal | — | opt-in lab=1; fixed lab=0 |
| `seedling` | object | — | |text caption |  |
| `pollen` | object | — | |text caption |  |
| `stoma` | object | — | |text caption |  |
| `vessels` | diagram | Xylem, Phloem, water, sugar | — | had lab=0; now labels=0 too |
| `punnett` | diagram | — | allele letters and genotypes from |text (default Bb x Bb) |  |
| `photosynth` | scene | CO₂, H₂O, O₂, Sugar | — | sun, beams, leaf are base recipes in recipes.js |
| `amoeba` | object | — | |text caption |  |

### chemgr (27)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `pointgroup` | diagram | symmetry element labels (C₂, C₃, σv, σh, S₄), molecule name, point group, operations, order h, legend lines, captions | atom symbols, caller |text |  |
| `huckel` | diagram | E axis, α, level energies (α + 1.618β …), node counts, HOMO/LUMO, C1–C4, Frost/energy captions | ψ level labels, caller |text |  |
| `pes` | diagram | axis titles r_AB, r_BC, V, reaction coordinate, valley/saddle legend, A + BC / AB + C, Ea, ΔE, captions | ‡ saddle marker, caller |text |  |
| `marcus` | diagram | axis titles, D–A / D⁺–A⁻, ΔG°, λ, ΔG‡, equations, region caption | ‡ crossing marker, caller |text |  |
| `dielsalder` | diagram | Δ, diene/dienophile/cyclohexene, captions, in phase, HOMO/LUMO titles, C1–C4, legend | CO₂Me substituent (mol), caller |text |  |
| `fmo` | diagram | E axis, LUMO/HOMO, new bonding MO, antibonding, gap notes, nucleophile/electrophile headings, stabilization equation | caller |text |  |
| `aldol` | diagram | step captions, α-H removed, enolate, alkoxide, H₂O, −H₂O Δ, E1cB over arrows, α, β markers, product names | atom symbols, HO⁻, + H₂O, + HO⁻, caller |text |  |
| `grignard` | diagram | RMgBr formation equation row, dry Et₂O, polarization note, alkoxide, H₃O⁺ workup, + Mg²⁺ salts, scope caption | atom symbols, δ− δ+, ⁺MgBr, caller |text |  |
| `wittig` | diagram | ylide, ketone or aldehyde, [2+2], oxaphosphetane, ring notes, retro, driving-force captions | atom symbols, + Ph₃P=O, caller |text |  |
| `eas` | diagram | slow/fast, arenium caption, aromaticity restored, reagent list, directing table text (headings, groups), o/m/p labels, explanations | E⁺, H, E on sp³ carbon, + ring charges, ↔, B:, + H–B⁺, Y, caller |text | k=directing becomes an empty table grid plus ring when lab=0 |
| `retrosynthesis` | diagram | a / b markers, target, name, disconnection/synthon/reagent lines, forward route, ⇒ legend | atom symbols, caller |text |  |
| `catcycle` | diagram | step names, oxidation-state notes, Suzuki | Pd species in boxes, Ar–X, Ar′–B(OH)₂ + base, X⁻ + B(OH)₃, Ar–Ar′, caller |text |  |
| `complexgeom` | scene | geometry names, examples/angles, titles, cis/trans, fac/mer, legend, explanations | M, Pt, Cl / NH₃ ligand labels, caller |text | k=all: four geometry ball-and-stick models (octahedral, square planar, tetrahedral, trigonal bipyramidal) - no standalone recipes for these complexes; isomers:  |
| `bragg` | diagram | d sin θ, θ, d, incident/diffracted, Bragg equation, Miller indices, axis titles, sample note | 2θ ticks, caller |text |  |
| `cosy` | diagram | peak letters a b c, axis titles, molecule and legend lines | δ ticks, caller |text |  |
| `jcoupling` | diagram | J values, intensity ratios, multiplet names, titles, Pascal triangle | caller |text |  |
| `jablonski` | diagram | legend (absorption, IC, fluorescence, ISC, phosphorescence + timescales), legend notes, singlets/triplet | S₀ S₁ S₂ T₁ state labels, caller |text |  |
| `cyclicvolt` | diagram | axis titles, anodic/cathodic, Epa, Epc, ΔEp, ipa, ipc, E½, inset E, t, Eλ, equations, convention note | potential ticks, caller |text |  |
| `chromatogram` | diagram | axis titles, inject, t₀, t_R, w, peak numbers, resolution/k/N equations, column → detector, D | time ticks, caller |text |  |
| `arrhenius` | diagram | axis titles, intercept, Δ(1/T), Δ ln k, slope, equations, high/low T | 1/T ticks, caller |text |  |
| `gibbs` | diagram | region labels, axis titles, T*, legend case lines, equations, pure A/B, ξ axis, equilibrium/forward/reverse notes, ΔG°, G°(A), G°(B) | 0 tick, caller |text |  |
| `langmuir` | diagram | axis titles, larger K, θ ≈ KP, isotherm equation, surface captions, low/high P, assumptions | 0 and 1 ticks, caller |text |  |
| `polymerization` | diagram | step headings, Δ or hν, written initiation/termination equations, captions, step-growth equation, axis titles, Carothers notes, chain-growth (compare), point la | RO, OR, 2 RO•, chain species ~CH₂–CHX…, conversion and Xn ticks, caller |text |  |
| `bandofstability` | diagram | axis titles, N = Z, Z > 83 note, decay region labels, ²⁰⁸Pb, N/Z ratios | Z and N ticks, caller |text |  |
| `binaryphase` | diagram | T axis, phase-region labels, E (eutectic), Tm, TE, Tb marks, liquidus/solidus, bubble/dew, cooling, lever-rule and phase-rule notes, x_L, z, y_V, l_L, l_V, comp | A and B axis ends, caller |text |  |
| `colligative` | diagram | axis titles, ΔTf, ΔTb, Δp, solid/liquid/gas, legend, equations, h, U-tube labels, osmotic pressure | 1 atm, caller |text |  |
| `raoult` | diagram | p axis, x_B, pA*, pB*, legend equations, panel names, captions | 0 and 1 ticks, caller |text |  |

### chemistry (34)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `atom` | object | — | caller |text |  |
| `ecloud` | object | — | caller |text |  |
| `molecule` | object | — | atom symbols C H O N Cl, caller |text |  |
| `lattice` | object | — | caller |text |  |
| `ion` | object | — | symbol (from |text), charge badge q |  |
| `bond` | diagram | shared pair | Na, Cl, H atom symbols, e⁻, Na⁺, Cl⁻, caller |text |  |
| `beaker` | object | — | caller |text |  |
| `flask` | object | — | caller |text |  |
| `testtube` | object | — | caller |text |  |
| `tuberack` | object | — | caller |text |  |
| `bunsen` | object | — | caller |text |  |
| `beakertherm` | scene | — | caller |text | beaker + thermometer; both exist standalone (beaker, thermometer) |
| `dropper` | object | — | caller |text |  |
| `mcylinder` | object | — | scale numbers 20–100, caller |text |  |
| `labscale` | object | — | display reading (text or 0.00 g), caller |text |  |
| `matterbox` | object | — | caller |text |  |
| `statechange` | diagram | solid, liquid, gas, melting, boiling, freezing, condensing | — |  |
| `dissolve` | diagram | — | caller |text |  |
| `phscale` | object | acid, neutral, alkali | pH numbers 0–14, caller |text |  |
| `indicator` | scene | acid, alkali | pH 1/4/7/10/13 under tubes, caller |text | universal = row of coloured test tubes (testtube exists); litmus = beakers + litmus strips: litmus paper strip has no standalone recipe |
| `ptile` | object | — | number, symbol, name, mass (all from caller) |  |
| `ptable` | object | — | element symbols H He C N O Na Fe Cu, caller |text |  |
| `reaction` | diagram | reactants, products | reactant/product text from caller |  |
| `gasbubbles` | object | — | caller |text |  |
| `precipitate` | object | — | caller |text |  |
| `crystals` | object | — | caller |text |  |
| `rust` | object | — | caller |text |  |
| `ecell` | diagram | zinc, copper | − and + electrode signs, caller |text |  |
| `distill` | diagram | cold water in, water out | caller |text |  |
| `filtration` | diagram | — | caller |text |  |
| `chroma` | diagram | — | caller |text |  |
| `catalyst` | diagram | without catalyst, with catalyst, reactants, products, energy (axis), progress (axis) | caller |text |  |
| `polymer` | object | — | caller |text |  |
| `burette` | diagram | — | caller |text |  |

### chemuni (27)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `econfig` | diagram | written configuration (full and noble-gas short), element (Z = n) title, Cr/Cu exception note | subshell labels 1s 2s 2p …, caller |text |  |
| `trends` | diagram | arrow captions (ionization energy & electronegativity increase, atomic radius increases …), across/down explanations | F, He, Fr cell symbols, caller |text |  |
| `lewis` | object | molecule name (water, H₂O …), valence-electron caption | atom symbols, lone-pair dots, caller |text |  |
| `vsepr` | object | shape name, AXnEm, e.g. formula, grid captions (k=all) | bond angle value on the arc, caller |text | k=all is a grid of seven shapes, each reachable via k= |
| `hybrid` | diagram | hybrid caption (sp³: 4 hybrids …), unhybridized p note, E axis, mix, carbon: one electron per orbital | 2s, 2p, two sp / three sp² / four sp³ box labels, caller |text |  |
| `modiagram` | diagram | energy axis, bond order lines, X atom / X₂ molecule headings | 1s 2s 2p and σ/π/σ*/π* level labels, caller |text |  |
| `hbond` | diagram | hydrogen bond, explanation lines, temporary/induced dipole, dipole–dipole and London captions | O H Cl atom symbols, δ+ δ−, caller |text |  |
| `phasediagram` | diagram | axis titles, normal m.p./b.p. (generic), triple point, critical point, solid/liquid/gas (ice/water/vapor), supercritical, ice-density note | 1 atm, 0 °C / 100 °C (water), caller |text |  |
| `heatingcurve` | diagram | axis titles, ice, melting, ΔHfus, water, boiling: water + steam, ΔHvap, steam, slopes/plateaus caption | 0 and 100 ticks, caller |text |  |
| `gaslaw` | diagram | axis titles, law names and equations, PV = constant, push, explanations, PV = nRT and variable list, dashed: extrapolated | −273 °C, = 0 K, 0 °C, 0 K, 273 K ticks, caller |text |  |
| `mole` | diagram | box names (moles, mass, particles, gas volume + units), conversion factors on arrows, always go through moles | caller |text |  |
| `energyprofile` | diagram | axis titles, Ea, ΔH, reactants, products, transition state ‡, catalyst: lower Ea, exo/endothermic caption | caller |text |  |
| `collisiontheory` | diagram | effective/ineffective captions, bounce apart, axis titles, Ea, T₁, T₂ > T₁, shaded caption | A, B, C particle letters, caller |text |  |
| `equilibrium` | diagram | axis titles, [A], [B], Q = K, Q < K, A added, shift caption, Le Chatelier caption | caller |text |  |
| `titration` | diagram | axis titles, equivalence point, half-equivalence, pH = pKa, buffer region, acid/base title | pH 0/7/14 and 25 mL ticks, caller |text |  |
| `buffer` | diagram | buffer title, add H⁺ / add OH⁻, reaction equations, soaks-up captions, Henderson–Hasselbalch equation, caption | HA / A⁻ species in the beaker, caller |text |  |
| `electrolysis` | diagram | anode (+), cathode (−), O₂, H₂ (2×), half-reactions, molten NaCl, cations → cathode caption | + − terminal signs, e⁻, ion symbols Na⁺ Cl⁻ + −, caller |text |  |
| `calorimeter` | diagram | thermometer, stirrer, lid, two nested foam cups, solution, q equations, insulated jacket, ignition wires, steel bomb, sample + O₂, water bath, constant p/V note | caller |text |  |
| `bornhaber` | diagram | level species (Na(s) + ½Cl₂(g) …), step names and kJ values, Hess sum | caller |text |  |
| `irspectrum` | diagram | axis titles, peak labels (O–H, C–H, C=O, C–O), fingerprint region, compound title | wavenumber ticks, caller |text |  |
| `nmrspectrum` | diagram | axis title, peak labels (CH₃ triplet, 3H …), TMS, ethanol and rule captions | δ ticks, caller |text |  |
| `massspec` | diagram | axis titles, peak labels (M⁺, base peak, fragments), compound/ratio captions | m/z and abundance ticks, caller |text |  |
| `beerlambert` | diagram | light source, I₀, I, b (cm), cuvette, conc. c, detector, A = εbc, A = log(I₀/I), axis titles, slope = εb, variable list | caller |text |  |
| `functionalgroups` | scene | group names, condensed formulas | atom symbols in structures (R, O, OH, NH₂, X), caller |text | grid of 12 cards |
| `sn2` | diagram | mechanism captions (one step…, rate = …), slow, planar carbocation, racemic caption, β-H | atom symbols C H R Br, HO⁻ / Nu⁻, δ−, ‡, +, C⁺, Br⁻, products R–CH=CH–R, + H₂O + Br⁻, caller |text |  |
| `crystalfield` | diagram | free ion: 5 equal d, Δo / Δt, summary (dⁿ, spin, unpaired), ligand-field note | orbital set labels eg / t₂g / e / t₂, caller |text |  |
| `rateorder` | diagram | axis titles, slope labels, order names, integrated rate laws, half-lives, caption | caller |text |  |

### computing (33)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `arraybox` | diagram | "index" | cell values, index numbers, caller name |  |
| `linkedlist` | diagram | "null", default "head" (when no |head) | node values, caller head label |  |
| `pushstack` | diagram | "push"/"pop", "top" | values, caller name |  |
| `queueline` | diagram | "dequeue", "enqueue", "front", "back" | values, caller name |  |
| `bintree` | diagram | — | node values, caller name | generic tool: words come from caller text/options |
| `bstpath` | diagram | comparison notes ("6 < 8"), default "find 6"/"find 6: not there" (when no |name) | node values, caller name |  |
| `nodegraph` | diagram | — | node names, edge weights, caller name | generic tool: words come from caller text/options |
| `hashtable` | diagram | "hash" box label | keys, bucket numbers, caller name |  |
| `sortbars` | diagram | "swap", compare note "5 > 2 ?", "sorted" | bar values, index numbers, caller name |  |
| `binarynum` | diagram | sum line "8 + 4 + 1 = 13" | bits, place values, caller name |  |
| `bitrow` | diagram | byte code captions ("'H' = 72"), "1 bit", "1 byte = 8 bits" | bits, letters from caller |  |
| `logicgate` | object | default gate name AND/OR… (when no |name) | A = 1, B = 0, Q = 1 wire values, caller name |  |
| `truthtable` | diagram | default title "AND gate" (when no |title) | A, B, Q headers, 0/1 cells, caller title |  |
| `cpubus` | diagram | CPU, Control unit, ALU, Registers, Memory, address bus, data bus, Input / Output, memory contents LOAD 5, ADD 3, STORE 6 | memory addresses 0–3, data value 42, caller title |  |
| `fdecycle` | diagram | Fetch, Decode, Execute and their notes, default "repeat" (when no |centre) | caller centre text |  |
| `clientserver` | scene | "Client", "Server", "request: ", "response: " prefixes, default request/response text (when no |text) | request and response from caller |  |
| `dnslookup` | scene | "DNS server", "website", "you", "connect", default name and IP (when no |text) | step numbers 1–3, name and IP from caller |  |
| `packetroute` | scene | default "message" (when no |message), "put back in order", "routers" | packet numbers 1–3, caller message |  |
| `encrypt` | diagram | "plaintext", "ciphertext", "key: shift 3", "the same key turns it back" | plaintext and ciphertext letters (default HELLO kept as data) |  |
| `keypair` | scene | "public key", "anyone can lock", "private key", "only you can open" | caller title |  |
| `filetree` | diagram | default file and folder names (when no |text) | names from caller |  |
| `codewin` | object | — | code lines (default sample code kept as data), line numbers | no hard-coded words beyond sample code |
| `ctrlflow` | diagram | start, end, yes, no, do this, do that, repeat step, loop, default condition (when no |condition) | condition from caller |  |
| `recursion` | diagram | call lines "fact(4) = 4 × fact(3)", "fact(1) = 1 (base)", "calls", "returns 24" | — | call lines are formulas built with the caller fname; all hidden with lab=0 |
| `apicall` | scene | "API" box, default app/service/request/response (when no |text) | app names, request, response from caller |  |
| `cloudsync` | scene | default "same file everywhere" (when no |text) | caller text |  |
| `pixelgrid` | diagram | "each pixel", "is a number", default "image" (when no |name), "0 = dark, 255 = light" | brightness numbers, caller name |  |
| `compress` | diagram | "compress" | letters and run-length code (default AAAAABBBCC kept as data), length numbers |  |
| `qrcode` | object | — | caller text | generic tool: words come from caller text/options |
| `firewall` | scene | "internet", "your network", "allowed", "blocked", default "firewall" (when no |title) | caller title |  |
| `pwmeter` | diagram | "password" heading, strength word Weak/Fair/Good/Strong, "N characters, digits, symbols…" line | password text (default sunflower7 kept as data) |  |
| `commits` | diagram | "feature" branch name, "HEAD" tag, default commit messages (when no |text) | hash codes, commit messages from caller |  |
| `mltrain` | scene | data, model, prediction, error, "answer was 9", adjust | prediction value "7 ?", caller title |  |

### daily (41)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `stove` | object | — | — |  |
| `fridge` | object | — | — |  |
| `microwave` | object | — | 1:30 |  |
| `kettle` | object | — | — |  |
| `toaster` | object | — | — |  |
| `oven` | object | — | 180° |  |
| `sink` | object | — | — |  |
| `washer` | object | — | — |  |
| `ceilingfan` | object | — | — |  |
| `aircon` | object | — | 18° |  |
| `room` | scene | — | — |  |
| `sofa` | object | — | — |  |
| `lamp` | object | — | — |  |
| `door` | object | — | — |  |
| `fruit` | object | — | — |  |
| `veg` | object | — | — |  |
| `bread` | object | — | — |  |
| `ricebowl` | object | — | — |  |
| `egg` | object | — | — |  |
| `milk` | object | — | MILK or |text |  |
| `cheese` | object | — | — |  |
| `waterglass` | object | — | — |  |
| `lunchbox` | scene | — | — |  |
| `recipe` | object | — | caller |text |  |
| `measuring` | object | — | 1 cup, ½, ¼, 1 tbsp, 1 tsp, ½ tsp |  |
| `backpack` | object | — | — |  |
| `pencilcase` | object | — | — |  |
| `notebook` | object | — | caller |text |  |
| `board` | object | — | caller |text |  |
| `ball` | object | — | — |  |
| `cricketbat` | object | — | — |  |
| `track` | object | — | 1, 2, 3, 4 |  |
| `pool` | object | — | — |  |
| `helmet` | object | — | — |  |
| `podium` | object | — | 1, 2, 3, caller |text names |  |
| `instrument` | object | — | — |  |
| `musicstaff` | object | note names under the notes (C D E ...) | — | notes from |text still drawn; only their printed names are gated |
| `palette` | object | — | — |  |
| `clothes` | object | — | — |  |
| `umbrella` | object | — | — |  |
| `toothbrush` | object | — | — |  |

### diagrams (32)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `flownode` | object | built-in placeholder text when no |text ("Do the step", "Is it done?", "Start"…) | caller text |  |
| `connector` | object | — | caller label | generic tool: words come from caller text/options |
| `processrow` | diagram | built-in placeholder text when no |text ("Step 1"…) | step names from caller, join= option word, circle numbers |  |
| `stagecycle` | diagram | built-in placeholder text when no |text ("Stage 1"…) | centre and stages from caller |  |
| `feedbackloop` | diagram | "reinforcing"/"balancing", built-in placeholder text when no |text ("More practice"…, "Room too hot"…) | + / − sign, parts from caller |  |
| `orgtree` | diagram | built-in placeholder text when no |text ("Head", "Team A"…) | names from caller |  |
| `mindmap` | diagram | built-in placeholder text when no |text ("Big idea", Who/What/Where…) | centre and ideas from caller |  |
| `twocol` | diagram | built-in placeholder text when no |text (Pros/Cons, Before/After, Sun vs Moon lists) | columns from caller, VS badge, tick/cross marks |  |
| `cardgrid` | diagram | built-in placeholder text when no |text ("Idea:what if?"…) | cards from caller, card numbers |  |
| `tierpyramid` | diagram | built-in placeholder text when no |text ("Dreams", "Respect"…) | levels from caller |  |
| `funnel` | diagram | built-in placeholder text when no |text ("Hear about it"…) | stages from caller, vals= numbers |  |
| `layerstack` | diagram | built-in placeholder text when no |text ("App", "Transport"…) | layers from caller, layer numbers |  |
| `concentric` | diagram | built-in placeholder text when no |text ("Me", "Family"…) | rings from caller |  |
| `causefan` | diagram | "causes", "effect" headings, built-in placeholder text when no |text ("Plant wilts"…) | effect and causes from caller |  |
| `fishbone` | diagram | built-in placeholder text when no |text ("Late to school", categories…) | problem and causes from caller |  |
| `milestones` | diagram | built-in placeholder text when no |text ("Mon:Idea"…) | events from caller |  |
| `ganttbars` | diagram | "now" marker word, built-in placeholder text when no |text (Plan, Design…) | time numbers, u= option, task names from caller |  |
| `quadrants` | diagram | built-in placeholder text when no |text ("Plan it"…, "Urgent", "Important") | quadrant and axis names from caller |  |
| `scalemark` | diagram | built-in placeholder text when no |text ("Low", "High") | end labels and marker caption from caller |  |
| `levelmeter` | diagram | built-in placeholder text when no |text ("Low", "High") | end labels and caption from caller |  |
| `checksteps` | diagram | built-in placeholder text when no |text ("Step 1"…) | step names from caller, step numbers, ticks |  |
| `ipo` | diagram | INPUT, PROCESS, OUTPUT headings, built-in placeholder text when no |text ("Flour, eggs, milk"…) | three parts from caller |  |
| `nodenet` | diagram | built-in placeholder text when no |text ("Node 1"…) | hub and nodes from caller |  |
| `callout` | object | built-in placeholder text when no |text ("Did you know?") | caller text |  |
| `sticky` | object | built-in placeholder text when no |text ("Remember this!") | caller text |  |
| `numlist` | object | built-in placeholder text when no |text ("Read the question"…) | title and points from caller, point numbers |  |
| `highlight` | object | — | caller note | generic tool: words come from caller text/options |
| `bigarrow` | object | — | caller text | generic tool: words come from caller text/options |
| `brace` | object | — | caller text | generic tool: words come from caller text/options |
| `bigsym` | object | — | — | symbol only, no words |
| `qacard` | object | built-in placeholder text when no |text (sky question) | Q and A badges, question and answer from caller |  |
| `termcard` | object | "e.g." prefix on the example line, built-in placeholder text when no |text ("Habitat"…) | term, definition, example from caller |  |

### earth (40)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `globe` | object | — | — |  |
| `earthlayers` | diagram | Crust, Mantle, Outer core, Inner core | — |  |
| `plates` | diagram | — | — |  |
| `volcano` | diagram | — | — |  |
| `plume` | object | — | — |  |
| `quakewaves` | diagram | — | — |  |
| `folds` | diagram | — | — |  |
| `rock` | object | — | — |  |
| `fossil` | diagram | — | — |  |
| `river` | diagram | Meander, Delta | — | labels are opt-in (labels=1); lab=0 or labels=0 now hide them |
| `glacier` | scene | — | — |  |
| `dune` | scene | — | — |  |
| `rainforest` | scene | — | — |  |
| `currents` | diagram | — | — |  |
| `shorewave` | object | — | — |  |
| `tide` | diagram | Moon, Pull (default when no |text) | — | |text replaces Pull and stays shown |
| `weatherfront` | diagram | Cold air, Warm air | — |  |
| `storm` | object | — | — |  |
| `tornado` | object | — | — |  |
| `hurricane` | object | — | — |  |
| `snowflake` | object | — | — |  |
| `rainbow` | object | — | — |  |
| `greenhouse` | diagram | Greenhouse gases, Heat trapped | — | labels are opt-in (labels=1); lab=0 or labels=0 now hide them |
| `atmosphere` | diagram | Troposphere, Stratosphere, Mesosphere, Thermosphere | — |  |
| `carboncycle` | diagram | CO₂ | — |  |
| `solarsystem` | diagram | — | — |  |
| `planet` | object | — | — |  |
| `moonphases` | diagram | New, Crescent, Quarter, Gibbous, Full | — |  |
| `seasons` | diagram | Jun, Sep, Dec, Mar | — |  |
| `eclipse` | diagram | Sun, Moon, Earth | — |  |
| `starshine` | object | — | — |  |
| `constellation` | diagram | — | — |  |
| `galaxy` | object | — | — |  |
| `blackhole` | object | — | — |  |
| `comet` | object | — | — |  |
| `asteroid` | object | — | — |  |
| `spacerocket` | object | — | — |  |
| `spacesat` | object | — | — |  |
| `astronaut` | object | — | — |  |
| `spacescope` | object | — | — |  |

### economy (30)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `candles` | diagram | — | caller |text, axis numbers, last price and % change, ▲▼ |  |
| `market` | diagram | market up / market down (default) | caller |text |  |
| `inflation` | diagram | then/now (default year names), prices (in "prices +N%"; +N% stays), caption "same $20, N items → M" | caller years, money= note, +N% |  |
| `interest` | diagram | years, simple, compound, default caption "$P at R% a year" | caller |text, axis/year numbers, final values |  |
| `loan` | diagram | "$X a month, R% a month" caption, "paid off: N months, total $X" / "still owing after 24 months" | caller |text, balance values, axis numbers | summary lines are explanatory sentences, hidden whole |
| `budget` | diagram | Total (word; amount stays) | category names/amounts (caller or default data), percents |  |
| `cashflow` | diagram | month N (default names), income, expenses | caller names, net +/- amounts, axis numbers |  |
| `savegoal` | object | goal (word; amount stays) | caller |text, tick amounts, current amount and % |  |
| `creditscore` | object | Poor/Fair/Good/Excellent (default bands), credit score | caller band names, min/max, score |  |
| `paytax` | diagram | paycheck, take-home, tax (words; amounts stay) | caller |text, amounts, tax % |  |
| `payslip` | object | this month (default when month= not given) | PAYSLIP (form heading), Net pay (printed row), rows, month= value, net amount |  |
| `invoice` | object | — | INVOICE, No. 0042, due in 30 days, Bill to:, Item, Amount, Tax N%, Total due, PAID stamp, rows | all printed form text; nothing gated |
| `receipt` | object | — | RECEIPT, Subtotal, Tax N%, TOTAL, thank you! / msg=, rows | all printed till text; nothing gated |
| `vault` | object | — | caller |text |  |
| `atm` | object | — | ATM (sign on machine), Welcome / caller screen text, insert card (on screen), card (printed at slot) | all physically on the machine; nothing gated |
| `mobilepay` | scene | tap | Paid (phone screen), $12.50 / caller amount |  |
| `exchange` | diagram | — | USD/EUR currency codes on coins (default or caller), rate lines (computed) | currency codes treated as coin marks, kept |
| `gdp` | diagram | Country A.. (default names), GDP (default yl title) | caller names, yl= value, values |  |
| `bizcycle` | diagram | Boom/Recession/Trough/Recovery (default), time, output (GDP) (default axis titles), trend | caller phase names, xl=/yl= values |  |
| `profit` | diagram | revenue, cost, profit/loss | caller |text, amounts, − and = signs |  |
| `breakeven` | diagram | units sold (default xl), fixed cost, total cost, revenue, break-even: / units (words; "Q, $V" stays), loss, profit, never-breaks-even warning | caller |text, axis numbers, xl= value |  |
| `hockeystick` | diagram | Idea/Launch/Growth (default), time, users (default axis titles) | caller stages, xl=/yl= values |  |
| `supplychain` | diagram | Factory/Truck/Shop/Customer (defaults beyond caller names), SHOP sign on the shop (passes lab through to building) | caller names | flow diagram built from scenes: factory+shop = building, customer = person; truck has no recipe (vehicle has car/bus/train only) |
| `oppcost` | diagram | Bike/Books (default), chosen, opportunity cost | caller choices |  |
| `scarcity` | scene | default caption "N people want it, K to go round" | caller |text | apples = fruit k=apple |
| `insurance` | scene | — | caller |text | umbrella exists (daily umbrella), house = building k=house; nothing gated |
| `shares` | diagram | — | caller owner names, percents |  |
| `crowdfund` | scene | raised, goal, backers (words; numbers stay) | caller |text, amounts, %, backer count | people = person/people, coins = coin |
| `pricetag` | object | — | caller |text, old/new price, -N% |  |
| `productbox` | object | Product (default box label) | caller label |  |

### engineering (37)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `bridge` | object | compression, tension, load, supports push up | — | forces=1 words (compression, tension, load, supports push up) now behind lab=0 |
| `skyframe` | object | — | — | draws no words of its own (only caller text); unchanged |
| `foundation` | diagram | Topsoil, Clay, Sand and gravel, Bedrock | — | had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `crane` | object | — | — | draws no words of its own (only caller text); unchanged |
| `excavator` | object | — | — | draws no words of its own (only caller text); unchanged |
| `dam` | object | — | — | draws no words of its own (only caller text); unchanged |
| `hydro` | diagram | Reservoir, Dam, Penstock, Turbine, Generator, River, Grid | — | already gated by labels=0; lab=0 now also works (labelsOn); had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `nuclear` | object | — | — | draws no words of its own (only caller text); unchanged |
| `geothermal` | diagram | cold water in, hot water up, hot rock | — | had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `tidal` | object | — | — | draws no words of its own (only caller text); unchanged |
| `biomass` | scene | CO₂ | — | power plant has powerplant, tree has tree |
| `batterybank` | scene | — | — | pylon: powerline; draws no words of its own (only caller text); unchanged |
| `gridmap` | diagram | Power station, Step-up, Pylons, Substation, Homes | — | had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `transformer` | object | — | — | draws no words of its own (only caller text); unchanged |
| `watertreat` | diagram | Intake, Settle, Filter, Clean, Store, Tap | Cl | Cl printed on the chlorine tank kept; had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `pipevalve` | object | — | — | draws no words of its own (only caller text); unchanged |
| `pump` | object | — | — | draws no words of its own (only caller text); unchanged |
| `wastewater` | diagram | Screen, Settle, Air + microbes, Clarify, River | — | had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `irrigation` | scene | — | — | river exists; draws no words of its own (only caller text); unchanged |
| `glasshouse` | object | — | — | draws no words of its own (only caller text); unchanged |
| `trafficlight` | object | — | — | draws no words of its own (only caller text); unchanged |
| `junction` | scene | — | — | car exists; draws no words of its own (only caller text); unchanged |
| `roundabout` | scene | — | — | car exists; road layout is the drawing itself; draws no words of its own (only caller text); unchanged |
| `railsignal` | scene | — | — | track exists; draws no words of its own (only caller text); unchanged |
| `runway` | scene | — | — | airplane exists; runway numbers 09/27 kept (painted on the runway); draws no words of its own (only caller text); unchanged |
| `flightforces` | diagram | Lift, Weight, Thrust, Drag | — | had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `aerocar` | diagram | — | — | draws no words of its own (only caller text); unchanged |
| `windtunnel` | object | — | — | draws no words of its own (only caller text); unchanged |
| `beltdrive` | object | — | — | draws no words of its own (only caller text); unchanged |
| `hydraulic` | diagram | small push, big lift | — |  |
| `heatpump` | scene | — | — | house is a private helper, no standalone house recipe (building exists); draws no words of its own (only caller text); unchanged |
| `insulation` | diagram | Plaster, Insulation, Gap, Brick, Warm inside, Cold outside | — | had labels= gating already (on by default, unchanged); lab=0 now also hides |
| `deforest` | scene | — | — | tree exists; draws no words of its own (only caller text); unchanged |
| `oceanplastic` | scene | — | — | fish: seacreature; draws no words of its own (only caller text); unchanged |
| `smog` | scene | — | — | skyline, factory, car exist; draws no words of its own (only caller text); unchanged |
| `footprint` | object | CO₂ (default when no text) | caller text t | default CO₂ inside the print hidden with lab=0; caller text t still shown |
| `evpetrol` | scene | Electric, Petrol | — | car, evcharge exist; had labels= gating already (on by default, unchanged); lab=0 now also hides |

### health (40)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `ivbag` | object | drip chamber, clamp | Saline / |text printed on bag |  |
| `infpump` | object | — | 125 mL/h / |text on screen |  |
| `bpcuff` | object | 120/80 default reading, mmHg | |text reading | scale has no printed numbers |
| `pulseox` | object | ♥ 72 bpm | SpO₂ and 98% / |text on its screen |  |
| `o2mask` | object | — | — |  |
| `nebulizer` | object | medicine, mouthpiece | — |  |
| `hospbed` | object | — | — |  |
| `wheelchair` | object | — | — |  |
| `walker` | object | — | — |  |
| `insulinpen` | object | — | dose number in window (10 / |text) |  |
| `glucometer` | object | — | 112 / |text and mg/dL on screen |  |
| `vial` | object | 0.5 mL dose caption (k=dose, default) | Vaccine / |text and 0.5 mL printed on vial label, |text dose caption | k=dose caption was lbl-gated even for |text; now |text always shows |
| `medcup` | object | — | 30 mL / 15 mL / 5 mL marks printed on cup |  |
| `pillbox` | object | AM, PM | day letters S M T W T F S on lids |  |
| `rxlabel` | object | — | Rx, label lines (|text or default) printed on label |  |
| `dressing` | diagram | cover film, absorbent pad, contact layer, wound bed | — |  |
| `ulcer` | diagram | Stage k title, skin, fat, muscle, bone | — |  |
| `handwash` | diagram | step captions 1 palm to palm … 6 fingertips | — |  |
| `ppe` | object | — | — |  |
| `droplets` | diagram | 6 ft (2 m) | — |  |
| `infchain` | diagram | six link names, Infection (default centre) | |text centre |  |
| `fluidbal` | diagram | Intake, Output | in/out mL values from options |  |
| `dehydration` | diagram | thirst, dry mouth, headache, dark urine, dizziness, tiredness | — |  |
| `urinechart` | diagram | hydrated, drink more, drink water now | — |  |
| `myplate` | object | vegetables, fruits, grains, protein, dairy | — |  |
| `nutrilabel` | object | — | Nutrition Facts and rows printed on label |  |
| `bmi` | diagram | under, healthy, over, obese, formula (default) | tick numbers 18.5 25 30, BMI <v> pointer value, |text |  |
| `exercise` | object | — | — |  |
| `hrzones` | diagram | very light, light, moderate, hard, max, % of max heart rate (default title) | Z1-Z5, 50%-100% ticks, |text title |  |
| `sleepcycle` | diagram | awake, REM, light, N2, deep | hour ticks 0h-8h, |text title |  |
| `posture` | object | upright / slouched (default) | |text |  |
| `firstaid` | object | — | — |  |
| `cpr` | diagram | 100–120 a minute (default), 2 in (5 cm) deep | |text |  |
| `recovery` | object | — | |text |  |
| `allergy` | diagram | peanut, hives | — | peanut and hives-skin have no standalone recipe |
| `diabetes` | diagram | insulin, glucose, blood sugar high/low/balanced (default) | ins printed on vial, |text |  |
| `scorebar` | diagram | — | value, min, max numbers, |text title |  |
| `painscale` | diagram | no hurt, a little, more, even more, a lot, worst | 0-10 numbers |  |
| `triage` | object | — | 1/2/3 and IMMEDIATE/DELAYED/MINOR printed on tag, |text |  |
| `patientchart` | object | — | Patient chart header and rows printed on the sheet |  |

### history (36)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `cavefire` | scene | — | — |  |
| `ploughfield` | scene | — | — |  |
| `oldwheel` | object | — | — |  |
| `citywall` | object | — | — |  |
| `ziggurat` | object | — | — |  |
| `longwall` | object | — | — |  |
| `aqueduct` | object | — | — |  |
| `amphitheatre` | object | — | — |  |
| `tablets` | object | — | — |  |
| `printpress` | object | — | — |  |
| `navtool` | object | — | N, E, S, W |  |
| `voyage` | diagram | Home port, New land (defaults, only when no |text) | N (chart compass), caller |text ports |  |
| `windmill` | object | — | — |  |
| `watermill` | object | — | — |  |
| `steamengine` | object | — | — |  |
| `steamtrain` | object | — | — |  |
| `telegraph` | scene | — | caller |text |  |
| `oldphone` | object | — | — |  |
| `inventbulb` | scene | — | — |  |
| `biplane` | object | — | — |  |
| `lander` | scene | — | — |  |
| `millrow` | object | — | — |  |
| `assembly` | diagram | 1, 2, 3 | — |  |
| `march` | scene | — | Clean Air, Fair Pay, Our Future (sign slogans) or |text | default slogans kept: text on the signs |
| `votecount` | diagram | — | Option A/B/C and counts on tally board or |text | tally text kept: data written on the board |
| `branches` | diagram | Constitution, makes laws, carries out laws, judges laws, checks and balances, Legislative, Executive, Judicial (defaults, only when no |text) | caller |text branch names |  |
| `charter` | object | — | We the People (title on parchment) or |text |  |
| `regionmap` | diagram | North, East, South, West, Centre (defaults, only when no |text) | N (north arrow), caller |text regions |  |
| `latlong` | diagram | Equator 0°, Prime meridian 0°, 30°N, 60°N, 30°S, 60°S | — | degree labels sit outside the globe as annotations, so gated |
| `timezones` | diagram | +N hours each zone, going east | H:00 clock times |  |
| `poppyramid` | diagram | Male, Female, % of people by age | 0+ 10+ ... age-band ticks |  |
| `migrate` | diagram | — | — |  |
| `caravan` | scene | — | — |  |
| `silkroad` | diagram | East City, Desert, Mountain Pass, Oasis, West Port (defaults, only when no |text) | caller |text stops |  |
| `oldcoins` | object | — | — |  |
| `museumcase` | object | — | caller |text label card |  |

### homefix (9)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `tieknot` | diagram | step number | — |  |
| `breaker` | object | — | breaker numbers |  |
| `ptrap` | diagram | — | — |  |
| `toilettank` | diagram | — | — |  |
| `studfinder` | object | — | — | now the device only; the wall is objects wallstuds (was a scene) |
| `furnacefilter` | object | — | AIR FLOW |  |
| `caulkgun` | object | — | — |  |
| `drywall` | object | — | — |  |
| `paintroller` | object | — | — |  |

### life (21)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `nitrogencycle` | diagram | Nitrogen gas in the air (N₂), lightning, nodules: fixing bacteria, nitrates, eaten, decomposers, denitrifying bacteria | — |  |
| `habitat` | scene | — | |text title | background scene; cactus and mushroom exist; no own words |
| `cactus` | object | spines: leaves, that lose little water, thick stem, stores water | |text caption |  |
| `fungus` | object | — | |text caption | no own words |
| `finch` | object | beak captions e.g. large crushing beak: seeds | |text caption |  |
| `pepperedmoth` | object | — | |text caption | no own words |
| `cladogram` | diagram | default group names (Fish..Mammals) when no |text, common ancestor, time → | |text group names |  |
| `protist` | object | — | |text caption |  |
| `lowerplant` | object | — | |text caption |  |
| `dispersal` | object | — | |text caption |  |
| `osmosis` | diagram | water, sugar solution, partly permeable membrane, water moves in | |text caption |  |
| `diffusion` | diagram | high concentration → low concentration, spread out evenly | |text caption |  |
| `respiration` | diagram | glucose, oxygen, carbon dioxide, water, lots of energy, ethanol, a little energy, lactic acid, in mitochondria, with oxygen, yeast, no oxygen: fermentation, mus | — | equation box words newly gated |
| `fermentation` | diagram | yeast + sugar water, carbon dioxide fills it | |text caption | flask+balloon; flask exists elsewhere |
| `transpiration` | diagram | roots take in water, up the xylem, water vapour out of stomata | |text caption |  |
| `energypyramid` | diagram | default level names when no |text, percent shares | |text level names | with lab=0 and |text, names stay, shares hidden |
| `quadrat` | object | count the plants inside the square | |text caption |  |
| `geneticengineering` | diagram | plasmid in a bacterium, cut open, human gene, gene inserted, bacteria make the protein | — |  |
| `cloning` | diagram | body cell, egg cell, nucleus out, embryo, the lamb is a clone | — |  |
| `kingdoms` | scene | Animals, Plants, Fungi, Protists, Bacteria | — | kingdom titles newly gated; mushroom/protist/bacterium exist |
| `homolog` | diagram | Human/Cat/Whale/Bat limb names, upper arm bone, two forearm bones, wrist bones, finger bones | — |  |

### math (35)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `axes` | diagram | — | tick numbers, xl/yl option text | generic tool: words come from caller text/options |
| `plot` | diagram | — | tick numbers, caller label | generic tool: words come from caller text/options |
| `scatter` | diagram | default best-fit equation "y ≈ mx + b" (when no |label) | tick numbers, caller label, xl/yl |  |
| `bars` | diagram | — | values, names from caller, pre/suf/yl options | generic tool: words come from caller text/options |
| `linechart` | diagram | — | values, names from caller | generic tool: words come from caller text/options |
| `pie` | diagram | — | percentages, names from caller | generic tool: words come from caller text/options |
| `numberline` | diagram | — | tick numbers, +n hop numbers, caller caption | generic tool: words come from caller text/options |
| `fraction` | object | — | n and d numbers, caller note | generic tool: words come from caller text/options |
| `coordgrid` | diagram | — | point names from caller, coordinates | generic tool: words come from caller text/options |
| `angle` | object | angle name (acute/right angle/obtuse/straight/reflex) | degrees, caller label |  |
| `protractor` | object | — | scale numbers, degree reading | no hard-coded words |
| `ruler` | object | — | numbers, unit u (option, default cm) | no hard-coded words |
| `triangle` | object | — | side lengths, angles, ? for hidden side, vertex names from caller | no hard-coded words |
| `circleparts` | diagram | radius, diameter, chord, arc, sector, circumference | r = / d = / C = values when val= given, caller label | with val= the measured values stay; chord/arc/sector names hide |
| `polygon` | object | polygon name (triangle, hexagon, n-gon) when no |name, "angles add to N°" | interior angle degrees, caller name |  |
| `solid` | object | — | dimensions from l= w= h= r=, caller label | no hard-coded words |
| `areagrid` | diagram | default caption "W × H = N squares" (when no |label) | side counts W and H, caller label |  |
| `venn` | diagram | — | region numbers, set names from caller, U (option u, set symbol) | generic tool: words come from caller text/options |
| `tally` | diagram | — | = total, row name from caller | generic tool: words come from caller text/options |
| `abacus` | object | default place names H, T, O… (when no |text) | number above, place names from caller |  |
| `counters` | object | — | caller label | generic tool: words come from caller text/options |
| `placevalue` | diagram | place words in captions (hundreds, tens, ones) | block counts, expanded form 243 = 200 + 40 + 3, caller label | lab=0 captions show the count only |
| `eqbalance` | diagram | — | = sign, sides from caller | generic tool: words come from caller text/options |
| `yearline` | diagram | — | dates (incl. BC), events from caller | generic tool: words come from caller text/options |
| `datatable` | diagram | — | cells from caller | generic tool: words come from caller text/options |
| `percentbar` | diagram | — | percent values, caller label | generic tool: words come from caller text/options |
| `spinner` | object | — | fractions, names from caller | generic tool: words come from caller text/options |
| `dice` | object | — | = total, caller label | generic tool: words come from caller text/options |
| `coinflip` | object | — | H/T on coins, caller label | generic tool: words come from caller text/options |
| `matrix` | object | — | entries, name option | generic tool: words come from caller text/options |
| `vector` | diagram | — | components, |v| = length, v(x, y), names (default v / a,b,… and "sum") | default vector names are variable letters; the sum vector default name "sum" kept |
| `slope` | diagram | "run = ", "rise = " words, default "slope = rise ÷ run = m" (when no |label) | run and rise numbers, point coordinates, caller label | lab=0 shows run/rise numbers only |
| `symmetry` | diagram | — | caller label | generic tool: words come from caller text/options |
| `pythagoras` | diagram | — | a² = 9, b² = 16, c² = 25, 9 + 16 = 25, caller label | variable letters and numbers only |
| `moneygrow` | diagram | "- - simple interest: $X" key | money values, year numbers, caller label |  |

### objects (23)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `tire` | object | — | — |  |
| `jack` | object | — | — |  |
| `tiregauge` | object | N psi reading | dial numbers |  |
| `headlight` | object | — | — |  |
| `brakes` | object | — | — |  |
| `radiator` | object | — | MAX, MIN | "HOT: do not open" removed (advice: the lesson says it) |
| `belt` | diagram | crank, A/C, alternator, tensioner, water pump, steering | — |  |
| `handtool` | object | — | — |  |
| `toolbox` | object | — | — |  |
| `tapemeasure` | object | — | inch numbers |  |
| `spiritlevel` | object | — | — |  |
| `ladder` | object | — | — | "not a step" removed (advice) |
| `outlet` | object | — | TEST, RESET |  |
| `lightswitch` | object | ON, OFF | — |  |
| `thermostat` | object | — | HEAT, temperature |  |
| `smokealarm` | object | — | — |  |
| `waterheater` | diagram | cold in, hot out, T&P valve, drain | — |  |
| `iron` | object | — | — |  |
| `plunger` | object | — | — |  |
| `shutoff` | object | — | — | "righty tighty" removed; the arrow shows only when closed |
| `extinguisher` | object | step number | ABC | k=plain is the bare object (new default); k=1-4 are the PASS steps |
| `carbattery` | object | 12V | +, − | new: split out of jumpstart |
| `wallstuds` | object | — | — | new: split out of the old studfinder scene |

### phys (28)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `seriespar` | diagram | series/parallel caption | A, V, +, −, caller text t |  |
| `symbols` | scene | all 12 symbol names | caller text t | chart of circuit symbols |
| `static` | diagram | metal cap, gold leaves spread, charged rod, attract, rubbed balloon (−), wall | + / − charge marks, caller text t |  |
| `wirefield` | diagram | current, magnetic field | N, S (solenoid poles), +, −, caller text t |  |
| `induction` | diagram | push magnet in, needle moves: a current is made | N, S, G (galvanometer symbol), caller text t |  |
| `refraction` | diagram | i, r, air, glass, normal, seen here, really here, light bends... caption, angle bigger than the critical angle, total internal reflection, optical fibre caption | caller text t |  |
| `raydiagram` | diagram | F, 2F, object, real image / virtual image | caller text t | F/2F treated as point names, gated |
| `curvedmirror` | diagram | F, concave/convex caption | caller text t |  |
| `eyedefect` | diagram | retina, normal/short/long sight caption, fixed with ... lens | caller text t |  |
| `pinhole` | diagram | pinhole, upside-down image, candle | caller text t |  |
| `shadow` | diagram | light, opaque ball, shadow | caller text t |  |
| `periscope` | diagram | mirror at 45°, mirror | caller text t |  |
| `belljar` | diagram | pump, air inside/pumped out caption | +, −, caller text t |  |
| `echo` | diagram | sound goes out, echo comes back, d | caller text t |  |
| `wavecompare` | diagram | soft/loud / low/high pitch captions | caller text t |  |
| `collision` | diagram | before, after, m (on carts), v, at rest, v/2, stops, momentum before = momentum after | caller text t |  |
| `circular` | diagram | velocity, force to the centre | caller text t |  |
| `moments` | diagram | d1 = 3 m, d2 = 2 m, 2 N × 3 m = 3 N × 2 m: balanced | 2 N, 3 N (on weights), caller text t |  |
| `hooke` | diagram | no load, 1 weight, 2 weights, x, 2x | caller text t |  |
| `freefall` | diagram | speeding up, still speeding up, terminal velocity, weight, air resistance, 0 s..5 s, it falls further every second | caller text t | strobe time labels gated as annotations |
| `pressure` | diagram | vacuum, 76 cm, air pushes down, mercury, deeper: higher pressure,, water spurts further | caller text t |  |
| `bimetal` | diagram | brass, iron, heated caption, cold: straight | caller text t |  |
| `penetration` | diagram | source, paper, aluminium, lead, alpha α, beta β, gamma γ | caller text t |  |
| `halflife` | diagram | time (T = half-life), atoms left | N, N/2, N/4, N/8 (y ticks), 1T, 2T, 3T (x ticks), caller text t |  |
| `goldfoil` | diagram | alpha source, gold foil, most go straight through, a few bounce back | caller text t |  |
| `photoelectric` | diagram | metal, light, electrons fly out | − on electrons, caller text t |  |
| `plug3` | object | fuse, earth, neutral, live | caller text t |  |
| `motiongraph` | diagram | time, velocity/distance, steady speed, speeding up, slowing down, at rest | caller text t |  |

### physadv (19)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `kepler` | diagram | A₁, A₂, fast, slow, equal areas caption, a, c, empty focus, r₁, r₂, e = c / a caption, Sun, perihelion, aphelion | caller text t |  |
| `rotation` | diagram | ω, axis at end/centre, I = ML²/3, I = ML²/12, L, mass M, parallel axis caption, r, F, θ, ω, α, τ out of page, τ formulas, disk: I = ½MR² | caller text t |  |
| `resonance` | diagram | t, x, envelope, legend words, critical damping caption, axis titles, ω₀, resonance caption | caller text t | legend swatches stay, legend words gated |
| `bernoulli` | diagram | Δh: P₁ > P₂, wide/narrow captions, A₁v₁ = A₂v₂, Bernoulli equation | caller text t |  |
| `standingwave` | diagram | N/A markers, n = …, λ = …, captions, legend line | caller text t |  |
| `doppler` | diagram | v_s, higher f, shorter λ, lower f, longer λ, Doppler formula | caller text t |  |
| `efield` | diagram | dashed: equipotentials, d, uniform E, E = V / d, E = kq / r², dipole/like caption | + / − on charges and plates, caller text t |  |
| `rccircuit` | diagram | R, C, S (closed at t = 0), +Q₀, −Q₀, I, V₀, axis titles t, V_C, τ = RC, 0.37/0.63 V₀, charging/discharging formula | + on cell, caller text t |  |
| `phasor` | diagram | R, L, C, V(t), I, X_L, X_C, Z, I, resonance formulas, V_R, V_L, V_C, V_L − V_C, V, φ, t, v, i, φ/ω, tan φ caption | caller text t |  |
| `righthand` | diagram | v, F, r, r = mv/(qB) caption, B into page, F = qv × B, right-hand rule caption | + on charge, × field marks, caller text t |  |
| `qho` | diagram | x, V = ½kx², n=… E=… labels, ħω, E = (n + ½)ħω caption | caller text t |  |
| `curvedspace` | diagram | M, light bends, planet, caption | caller text t |  |
| `standardmodel` | diagram | charges, particle names, I, II, III, three generations of matter, gauge bosons, scalar, quarks, leptons, charge in e (top left) | particle symbols u c t d s b e μ τ ν(e μ τ) g γ Z W H, caller text t | symbols kept as the table's content |
| `feynman` | diagram | time, n (u d d), p (u d u), d, u, W⁻, e⁻, ν̄e, e⁺, γ, captions | caller text t |  |
| `transistor` | diagram | S source, G gate, D drain, B body, n⁺, p-type substrate, electrons: n-channel, oxide, metal, channel caption, B, C, E, I_B, I_C, I_E, NPN, β formulas | caller text t |  |
| `laser` | diagram | full mirror, partial mirror, gain medium, pump, coherent beam, E₁ ground, E₂ metastable, E₃, fast decay, two identical photons, (stimulated emission), populatio | caller text t |  |
| `halleffect` | diagram | I, v, F = qvB, electron drift, V_H, B into page (×), captions | − / + charge rows, − on electron, V in voltmeter, × field marks, caller text t |  |
| `hrdiagram` | diagram | Sun, surface temperature (K) ← hotter, luminosity (L☉), main sequence, giants, supergiants, white dwarfs | 10ⁿ / 1 luminosity ticks, temperature ticks, O B A F G K M class ticks, caller text t |  |
| `blackbody` | diagram | intensity, wavelength λ (nm), visible, UV, infrared, 3000/4000/5000 K curve labels, Wien captions | 500 1000 1500 2000 ticks, caller text t |  |

### physgr (26)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `doublependulum` | diagram | lower bob path, (chaotic), θ_1, θ_2, l_1, l_2, m_1, m_2, generalized, coordinates, q = (θ_1, θ_2), L = T − V, T = ½(m_1+m_2)l_1^2`θ_1^2 + ½m_2l_2^2`θ_2^2 + m_2l | — | equation box frame is also hidden with lab=0 |
| `phasespace` | diagram | θ, p_θ, librations (closed), separatrix, rotations (open), H = p_θ^2/2ml^2 − mgl cos θ;   saddles at θ = ±π (unstable), x, p, stable focus, m``x + b`x + kx = 0: | −π, π |  |
| `normalmodes` | diagram | m, k, normal coordinates  q_± = (x_1 ± x_2)/√2;  any motion is a sum of the two | — |  |
| `gyroscope` | object | L, ω, τ = dL/dt, mg, r, Ω, precession about the vertical, L = Iω  along the axle, τ = r × mg  (horizontal), dL = τ dt ⊥ L: L swings, round, |L| unchanged, Ω = m | — | formula box frame is also hidden with lab=0 |
| `laminar` | diagram | U∞, δ(x), leading edge, no slip: u = 0 at the plate, boundary layer thickens downstream:  δ(x) ≈ 5x/√(Re_x), Re_x = ρUx/μ;  in general Re = ρvL/μ (inertia / vis | — |  |
| `fourier` | diagram | F, signal f(t), spectrum |F(ω)|, F(ω) = ∫ f(t) e^{−iωt} dt, Gaussian ↔ Gaussian:  e^{−t²/2σ²}  ↔  e^{−σ²ω²/2}, Δt · Δω ≥ ½  (equality only for a Gaussian), t, G | 1, 1/3, 1/5, 1/7, 1 3 5 7 (bar ticks) |  |
| `multipole` | diagram | V(r) = (1/4πε_0) [ q/r + p cos θ/r^2 + ½Q_{ij}n_in_j/r^3 + … ], far away the lowest nonzero moment dominates | +, − |  |
| `waveguide` | diagram | |E_y| ∝ sin(πx/a), a, b, x, y, z out of page ⊙, cross-section, TE₁₀, z: propagation, λ_g, side view at x = a/2, TE_{10}:  E_y = E_0 sin(πx/a) cos(kz − ωt), cuto | — |  |
| `dipoleradiation` | diagram | z (dipole axis), no radiation along the axis, dipole along z:  p(t) = p_0 cos ωt, θ, S, E, B, E along θ̂, B along φ̂ (⊗),, S along r̂, dP/dΩ ∝ sin^2θ, ⟨P⟩ = μ_0 | — |  |
| `boltzmann` | diagram | E, E_${i}, N_i ∝ g_i e^{−E_i/kT}, Z = Σ_i g_i e^{−E_i/kT},   N_i / N = g_i e^{−E_i/kT} / Z, here every degeneracy g_i = 1; dashed: exponential envelope | — |  |
| `quantumstats` | diagram | μ, ≈ 4kT smearing, Fermi–Dirac  1/(e^x + 1), Bose–Einstein  1/(e^x − 1), FD at T = 0, x = (ε − μ)/kT, all agree when ε − μ ≫ kT, BE diverges as ε → μ, ε, n(ε) | 1 |  |
| `ising` | diagram | T < T_c, ordered domains, T > T_c, random, M ≈ 0, T/T_c, Onsager, H = −J Σ_{⟨ij⟩} s_i s_j,   s_i = ±1, 2D:  kT_c = 2J / ln(1 + √2) ≈ 2.27 J | 1 |  |
| `bec` | diagram | v, velocity distribution of the trapped atoms, T/T_c, N_0/N = 1 − (T/T_c)^{3/2}, kT_c = (2πħ^2/m)(n/ζ(3/2))^{2/3}, ζ(3/2) ≈ 2.612, ground state macroscopically  | 1 |  |
| `blochsphere` | diagram | z, x, y, |ψ⟩, θ, φ, |0⟩, |1⟩, pure states: points, on the unit sphere, 0 ≤ θ ≤ π,  0 ≤ φ < 2π, |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ | — |  |
| `radialwave` | diagram | peak at r = a_0, r / a_0, radial functions R_{nl}(r):  n − l − 1 radial nodes, P(r) = r^2|R_{nl}|^2:  n − l − 1 radial nodes | r ticks 0.. |  |
| `zeeman` | diagram | +3ea_0E_{ext}, 0  (×2), −3ea_0E_{ext}, m_l = ${['+1', '0', '−1'][i]}, field E_{ext}, B, n = 2  (4 states), n = 1:  no linear shift, linear Stark effect, ΔE = ±3 | 0 |  |
| `crosssection` | diagram | θ, b, target  +Ze, incident beam, flux I, detector, dΩ = dA/r², dσ/dΩ = (b / sin θ) |db/dθ|  =  scattered rate per dΩ / incident flux, Rutherford:  dσ/dΩ = (zZe | — |  |
| `belltest` | diagram | source, D_A, D_B, coincidences, angle difference a − b, quantum: E = cos 2(a − b), local hidden variables, CHSH:  S = E(a,b) − E(a,b′), + E(a′,b) + E(a′,b′), lo | 0, 22.5°, 45°, 90°, +1, −1 |  |
| `qcircuit` | diagram | Bell pair, Bell measurement, X if m_2 = 1, then Z if m_1 = 1, m_1, m_2, two classical bits + one shared Bell pair send |ψ⟩ to qubit 3, the original is destroyed | |ψ⟩, |0⟩, H, X, Z | gate letters H/X/Z and input kets |0⟩ |ψ⟩ kept as circuit symbols |
| `detector` | diagram | missing E_T, photon γ, electron, charged hadron, neutral hadron, muon, neutrino, transverse view; beams along z, out of the page | — | legend and layer key hidden entirely (swatches too) with lab=0 |
| `phonons` | diagram | m_1, m_2, a, spring constant C,  m₁ > m₂, gap, k, ω, optical, acoustic, √(2C/m_2), √(2C/m_1), ω^2 = C(1/m_1 + 1/m_2) ± C√[(1/m_1 + 1/m_2)^2 − 4 sin^2(ka/2)/m_1m | −π/a, π/a, 0 |  |
| `bandstructure` | diagram | 1st Brillouin zone, k, E, band 1, band 2, folded free-, electron bands, reduced zone: k → k − G folds every band into −π/a < k ≤ π/a, free electron E = ħ^2k^2/2 | −2π/a, −π/a, π/a, 2π/a |  |
| `superconductor` | diagram | T < T_c, T > T_c, B expelled: Meissner, B passes through, B →, T, dashed: normal metal, T_c, R = 0, below T_c:  R = 0  and  B = 0 inside (perfect diamagnet, χ = | — |  |
| `hubble` | diagram | d_1, d_2, 1.6 d_1, 1.6 d_2, time, all distances grow by the scale factor a(t):  d(t) = a(t) d_0, so  v = `d = (`a/a) d = H d:  farther galaxies recede faster, e | ${v / 1000} 000, distance ticks, v ticks |  |
| `gravwave` | diagram | black hole binary inspiral, ring of free masses, wave along z (out of page), t, h(t), inspiral, merger, ringdown, chirp: f ∝ (t_c − t)^{−3/8},  h ∝ (t_c − t)^{− | — |  |
| `bindingenergy` | diagram | mass number A, fusion, fission, both release energy by moving toward the peak near iron, (most tightly bound per nucleon), B/A (MeV) | A ticks, B/A ticks |  |

### physics (32)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `magnet` | object | — | N, S, caller text t | no own words besides pole letters; txt unchanged |
| `cell` | object | — | +, −, caller text t | txt unchanged |
| `switch` | object | Open, Closed (default when no text) | caller text t | default word shows only if no caller text |
| `resistor` | object | — | caller text t | txt unchanged |
| `circuit` | diagram | — | +, − (cell symbol), caller text t | txt unchanged |
| `motor` | diagram | It turns / Turn it (default when no text) | N, S, +, −, caller text t |  |
| `electromagnet` | diagram | — | +, −, caller text t | txt unchanged |
| `forcebox` | diagram | Push, Friction, Weight, Normal | caller text t |  |
| `incline` | diagram | θ, Weight, Normal, Friction | caller text t |  |
| `pendulum` | diagram | θ | caller text t |  |
| `spring` | object | — | 1 kg (default mass marking), caller text t | txt unchanged |
| `lever` | diagram | Load, Effort, Fulcrum | caller text t |  |
| `pulley` | diagram | Load, Pull | caller text t |  |
| `wheelaxle` | diagram | Effort, Wheel, Load | caller text t |  |
| `wave` | diagram | Compression, Rarefaction, travels, Wavelength, Crest, Trough, Amplitude | caller text t |  |
| `prism` | diagram | White light, Red, Violet | caller text t |  |
| `lens` | diagram | F | caller text t |  |
| `mirror` | diagram | Normal, i, r, Incident ray, Reflected ray | caller text t |  |
| `thermometer` | object | — | 0, 50, 100, °C (default), caller text t | txt unchanged |
| `heat` | diagram | — | caller text t | txt unchanged |
| `bohr` | diagram | — | caller text t | txt unchanged |
| `spectrum` | diagram | Radio, Microwave, Infrared, Visible, UV, X-ray, Gamma, longer waves, more energy | caller text t |  |
| `rocket` | object | Thrust, Hot gas | caller text t | arrows=0 still hides arrows+words; lab=0 hides only words |
| `gravity` | diagram | Gravity (default when no text) | caller text t |  |
| `gauge` | object | — | dial numbers, km/h / bar, caller text t | txt unchanged |
| `stopwatch` | object | — | 60, 15, 30, 45, caller text t | txt unchanged |
| `energy` | diagram | Most PE, Most KE, Total, PE, KE, Energy | caller text t |  |
| `projectile` | diagram | Max height, Velocity, Range | caller text t |  |
| `friction` | diagram | Push, Friction, Rough surfaces grip (default when no text) | caller text t |  |
| `density` | diagram | Wood, Ball, Stone | caller text t |  |
| `fission` | diagram | Big nucleus (default when no text), Energy | caller text t |  |
| `cradle` | object | — | caller text t | txt unchanged |

### physuni (25)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `doubleslit` | diagram | d, L, bright fringes, y = mλL/d | — |  |
| `diffraction` | diagram | angle θ, intensity, d sin θ = mλ, central maximum, first minimum, a sin θ = mλ (minima) | m = 0, m = ±1, m = ±2 | grating order labels m = 0, ±1, ±2 kept as axis tick labels |
| `thinfilm` | diagram | t, film, n, air, path difference 2nt cos r: colours where 1 and 2 add up | — |  |
| `polarisation` | diagram | unpolarised, polariser, analyser at θ, I = I₀ cos²θ | — |  |
| `michelson` | diagram | fixed mirror, movable mirror, beam splitter, detector: fringes shift as the mirror moves λ/2 | — |  |
| `emwave` | diagram | c, E, B, E ⊥ B ⊥ direction; c = 1/√(μ₀ε₀) | — |  |
| `gauss` | diagram | E = λ / (2πε₀r), ∮ E·dA = q / ε₀, Gaussian surface | +, +q |  |
| `capacitorfield` | diagram | I, B circles the gap too, displacement current  I_d = ε₀ dΦ_E/dt | +, − |  |
| `maxwelleqs` | diagram | Gauss's law, no magnetic monopoles, Faraday's law, Ampère–Maxwell law, ∮ E·dA = Q/ε₀, ∮ B·dA = 0, ∮ E·dl = −dΦ_B/dt, ∮ B·dl = μ₀I + μ₀ε₀ dΦ_E/dt, ∇·E = ρ/ε₀, ∇· | — | all content is text (equation cards); with lab=0 only four empty coloured cards remain |
| `wellbox` | diagram | n=${n}  E=${n * n}E₁, Eₙ = n²h² / 8mL², L | — |  |
| `tunnelling` | diagram | incoming wave, barrier V₀, some gets through, E < V₀, decays inside: T ≈ e^(−2κa) | — |  |
| `energylevels` | diagram | Lyman (UV), Balmer (visible) | n=1..5, −13.60 … −0.54 eV, 0 eV | n= and eV values kept as scale ticks |
| `compton` | diagram | θ, photon λ, λ' > λ, electron recoils, λ' − λ = (h / mc)(1 − cos θ) | − |  |
| `orbitals` | object | x, y, s orbital: a sphere, d_xy: four lobes between the axes, p_x, p_y, colours: + and − phase | — |  |
| `sterngerlach` | diagram | oven, spin up, spin down, two spots, not a smear: spin is quantised | N, S |  |
| `wavepacket` | diagram | Δx, Δx · Δp ≥ ħ/2 | — |  |
| `lightclock` | diagram | at rest: t₀, v, moving: longer path, t = γ t₀,  γ = 1/√(1 − v²/c²) | — |  |
| `spacetime` | diagram | x, ct, light, ct', x', future, past, moving frame at v = ${v}c: axes tilt toward the light line | — |  |
| `contraction` | diagram | at rest: L₀, v, moving: L = L₀ / γ | — |  |
| `pvcycle` | diagram | W = area, Carnot: two isotherms, two adiabats; η = 1 − T_C/T_H, Otto (petrol): adiabats + constant volume, Diesel: heat in at constant pressure, V, P, 1, 2, 3,  | — |  |
| `heatengine` | diagram | hot reservoir T_H, cold reservoir T_C, fridge, engine, W in, K = Q_C / W, W out, η = W / Q_H ≤ 1 − T_C / T_H, Q_H, Q_C | — |  |
| `speeddist` | diagram | low T, high T, v_p, speed v, number of molecules | — |  |
| `bands` | diagram | E_g, metal, semiconductor, insulator, valence, conduction, red dashes: Fermi level | — |  |
| `crystal` | object | simple cubic, body-centred cubic, face-centred cubic | — |  |
| `pnjunction` | diagram | E, p-type (holes), n-type (electrons), depletion region, forward bias: barrier lowered, current flows, reverse bias: depletion widens, almost no current | +, − | +/− on ions, holes, electrons and battery kept as physical marks |

### tech (52)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `laptop` | object | — | caller |text |  |
| `computer` | object | — | caller |text | monitor, keyboard and tower drawn as one desktop set |
| `smartphone` | object | — | caller |text |  |
| `server` | object | — | — |  |
| `router` | object | — | caller |text |  |
| `netcloud` | object | — | caller |text |  |
| `envelope` | object | — | caller |text |  |
| `cable` | object | — | caller |text |  |
| `chip` | object | CPU (default when no text) | caller |text | CPU is a generic part name, not a fixed marking; a reused chip may be any chip, so it is gated |
| `ram` | object | — | — |  |
| `harddrive` | object | — | — |  |
| `keyboard` | object | — | — |  |
| `robot` | object | — | caller |text |  |
| `neuralnet` | diagram | — | caller |text |  |
| `padlock` | object | — | — |  |
| `key` | object | — | — |  |
| `database` | object | — | caller |text |  |
| `satdish` | object | — | — |  |
| `satellite` | object | — | — |  |
| `celltower` | object | — | — |  |
| `gpsmap` | object | — | — |  |
| `bulb` | object | — | — |  |
| `led` | object | — | — |  |
| `battery` | object | — | caller |text |  |
| `plug` | object | — | — |  |
| `solarpanel` | object | — | — |  |
| `turbine` | object | — | — |  |
| `powerplant` | object | — | — |  |
| `powerline` | object | — | — | two pylons with wires; one infrastructure object |
| `evcharge` | scene | — | — | car = vehicle k=car |
| `vehicle` | object | — | — |  |
| `bicycle` | object | — | — |  |
| `airplane` | object | — | — |  |
| `ship` | object | — | — |  |
| `piston` | diagram | — | — |  |
| `gears` | object | — | — |  |
| `conveyor` | object | — | — |  |
| `building` | object | SHOP (default sign on k=shop) | caller |sign, $ on bank pediment | shop still reads as a shop from the awning; $ on bank is a carved symbol, kept |
| `coin` | object | — | $ default / caller value |  |
| `banknote` | object | — | $ default / caller value |  |
| `card` | object | — | card number •••• 1234 (printed on card) / caller text |  |
| `moneyjar` | object | — | $ default / caller text |  |
| `wallet` | object | — | — |  |
| `cart` | object | — | — |  |
| `clock` | object | — | — |  |
| `calendar` | object | — | day number (1 default) |  |
| `book` | object | — | caller |text |  |
| `newspaper` | object | — | NEWS masthead (printed heading that makes it a newspaper) / caller name |  |
| `camera` | object | — | — |  |
| `mic` | object | — | — |  |
| `headphones` | object | — | — |  |
| `speaker` | object | — | — |  |

### world (42)

| Recipe | Type | Hidden by lab=0 | Always shown | Note |
|---|---|---|---|---|
| `animal` | object | — | — |  |
| `wild` | object | — | — |  |
| `bird` | object | — | — |  |
| `seacreature` | object | — | — |  |
| `critter` | object | — | — |  |
| `tree` | object | — | — |  |
| `flower` | object | — | — |  |
| `grass` | object | — | — |  |
| `mushroom` | object | — | — |  |
| `pond` | scene | — | — |  |
| `foodweb` | diagram | Grass, Rabbit, Snake, Eagle / Grass, Seeds, Rabbit, Mouse, Snake, Eagle (default node names, only when no |text) | caller |text node names |  |
| `person` | object | — | — |  |
| `people` | scene | — | — |  |
| `familytree` | diagram | — | caller |text names |  |
| `worldmap` | diagram | — | — |  |
| `mappin` | object | — | caller |text |  |
| `compassrose` | object | — | N, E, S, W |  |
| `routemap` | diagram | — | — |  |
| `skyline` | object | — | — |  |
| `hut` | object | — | — |  |
| `pyramids` | object | — | — |  |
| `castle` | object | — | — |  |
| `columns` | object | — | — |  |
| `sailship` | object | — | — |  |
| `scroll` | object | — | caller |text |  |
| `document` | object | — | — |  |
| `justice` | object | — | — |  |
| `ballot` | object | — | VOTE (printed on box) or |text | VOTE kept: printed on the box |
| `civic` | object | — | — |  |
| `courtroom` | scene | — | — |  |
| `classroom` | scene | — | A B C  1 2 3 (written on chalkboard) or |text | board text kept: it is writing on the object |
| `supplydemand` | diagram | Supply, Demand, Price, Quantity | — |  |
| `stall` | scene | — | — |  |
| `trade` | diagram | — | caller |text |  |
| `factory` | object | — | — |  |
| `recycle` | object | — | — |  |
| `timeline` | diagram | Stone Age, Ancient, Middle Ages, Modern (default eras, only when no |text) | caller |text era names |  |
| `idea` | object | — | — |  |
| `quiz` | object | — | — |  |
| `award` | object | — | — |  |
| `handshake` | object | — | — |  |
| `love` | object | — | — |  |

