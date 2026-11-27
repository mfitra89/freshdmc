import asyncio, base64, mimetypes, re
from pathlib import Path
from playwright.async_api import async_playwright
base=Path('/mnt/data/fresh_destination_complete_design')
pages=sorted(base.glob('*.html'))
css=(base/'styles.css').read_text()

def datauri(path):
    p=base/path
    mime=mimetypes.guess_type(str(p))[0] or 'application/octet-stream'
    return f'data:{mime};base64,'+base64.b64encode(p.read_bytes()).decode()
assets=['assets/logo.jpg','assets/sydney.jpg','assets/japan.jpg','assets/korea.jpg','assets/airport.jpg','assets/chauffeur.jpg','assets/vehicle.jpg']
uris={a:datauri(a) for a in assets}

def inline_html(html):
    text=html.read_text()
    text=text.replace('<link rel="stylesheet" href="styles.css">', '<style>'+css+'</style>')
    for a,u in uris.items(): text=text.replace(a,u)
    return text
viewports={
 'desktop': {'width':1600,'height':1000,'device_scale_factor':1.25},
 'tablet': {'width':1024,'height':1366,'device_scale_factor':1.25},
 'mobile': {'width':390,'height':844,'device_scale_factor':1.5},
}
async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-web-security'])
    for kind,v in viewports.items():
      out=base/'PNGs'/kind; out.mkdir(parents=True,exist_ok=True)
      context=await browser.new_context(viewport={'width':v['width'],'height':v['height']}, device_scale_factor=v['device_scale_factor'])
      pg=await context.new_page()
      for html in pages:
        await pg.set_content(inline_html(html), wait_until='load')
        await pg.screenshot(path=str(out/(html.stem+'.png')), full_page=True)
        print(kind, html.stem)
      await context.close()
    await browser.close()
asyncio.run(main())
