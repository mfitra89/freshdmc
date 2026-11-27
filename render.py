import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright
base=Path('/mnt/data/fresh_destination_complete_design')
pages=sorted(base.glob('*.html'))
viewports={
 'desktop': {'width':1600,'height':1000,'device_scale_factor':1.5},
 'tablet': {'width':1024,'height':1366,'device_scale_factor':1.5},
 'mobile': {'width':390,'height':844,'device_scale_factor':2},
}
async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for kind,v in viewports.items():
      out=base/'PNGs'/kind
      out.mkdir(parents=True,exist_ok=True)
      context=await browser.new_context(viewport={'width':v['width'],'height':v['height']}, device_scale_factor=v['device_scale_factor'])
      pg=await context.new_page()
      for html in pages:
        await pg.goto(html.as_uri(), wait_until='networkidle')
        await pg.screenshot(path=str(out/(html.stem+'.png')), full_page=True)
        print(kind, html.stem)
      await context.close()
    await browser.close()
asyncio.run(main())
