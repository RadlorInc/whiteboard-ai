import { test, expect } from "@playwright/test";

// Safari painted nothing for a recipe drawn at full size (a body, a protein): the hand-drawn filters' fixed 6000-unit
// region passed WebKit's filter size limit (beta report, 22 Oct 2026). A finished board, drawn at once ("poster"), must
// show both drawings, and a straight arrow, on a big retina screen in every browser; webkit is the one that broke.
test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

test("full-size drawings and straight lines are painted", async ({ page }) => {
  await page.goto("/player/index.html?subject=biology");
  await page.waitForFunction(() => "RECIPES" in window);
  const script = {
    q: "t", els: { body: "digestive 210 320 380", target: "enzyme 760 300 260 k=fit", arrow: "arrow 400 60 600 60 w=3" },
    steps: [{ say: "", do: ["draw body", "fill body", "draw target", "fill target", "draw arrow"] }],
  };
  await page.evaluate((s) => new Promise<void>((done) => {
    addEventListener("message", (e) => { if (e.data?.type === "posterDone") done(); });
    postMessage({ type: "poster", script: s }, "*");
  }), script);
  const board = await page.locator("svg").first().boundingBox();
  const k = board!.width / 960;
  // Share of ink (non-paper) pixels in a small square at a board point: 0 when nothing was painted there.
  const ink = async (x: number, y: number, r: number) => {
    const png = await page.screenshot({ clip: { x: board!.x + (x - r) * k, y: board!.y + (y - r) * k, width: 2 * r * k, height: 2 * r * k } });
    return page.evaluate(async (b64) => {
      const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
      const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      const g = c.getContext("2d")!; g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] < 600) n++;
      return n / (d.length / 4);
    }, png.toString("base64"));
  };
  expect(await ink(210, 330, 30), "body").toBeGreaterThan(0.1);
  expect(await ink(760, 320, 30), "protein").toBeGreaterThan(0.1);
  expect(await ink(500, 60, 3), "straight arrow").toBeGreaterThan(0.1);
});
