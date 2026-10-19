# Render molecules.json to 2D-structure SVGs with RDKit (BSD), one per molecule, plus meta.json (name, group, formula,
# stereo labels). Small molecules get explicit hydrogens so H2O reads as H-O-H.
#   python3 -I scripts/molecules/render.py <out dir>      (needs: pip install rdkit)
import json, os, sys
from rdkit import Chem
from rdkit.Chem import Draw, rdMolDescriptors, rdCIPLabeler
from rdkit.Chem.Draw import rdMolDraw2D
here, out = os.path.dirname(os.path.abspath(__file__)), sys.argv[1]
os.makedirs(out, exist_ok=True)
data, meta = json.load(open(os.path.join(here, 'molecules.json'))), []
for group, items in data.items():
    if group.startswith('_'): continue
    for name, smi in items:
        m = Chem.MolFromSmiles(smi)
        if m is None: print('bad SMILES', name); continue
        if m.GetNumHeavyAtoms() <= 3: m = Chem.AddHs(m)
        rdCIPLabeler.AssignCIPLabels(m)
        cip = sorted({a.GetProp('_CIPCode') for a in m.GetAtoms() if a.HasProp('_CIPCode')})
        d = rdMolDraw2D.MolDraw2DSVG(500, 400); o = d.drawOptions()
        o.clearBackground = False; o.bondLineWidth = 3; o.addStereoAnnotation = True; o.padding = .08; o.minFontSize = 18
        d.DrawMolecule(m); d.FinishDrawing()
        fid = name.lower().replace(' ', '-').replace('(', '').replace(')', '')
        open(os.path.join(out, fid + '.svg'), 'w').write(d.GetDrawingText())
        meta.append({'file': fid, 'name': name, 'group': group, 'formula': rdMolDescriptors.CalcMolFormula(m), 'cip': cip})
json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'), indent=0)
print(len(meta), 'molecules')
