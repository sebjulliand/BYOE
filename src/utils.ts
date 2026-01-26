import { code4i } from "./extension";

export function openOutput(title: string, output: string) {
  code4i.customUI()
    .addHeading(title, 2)
    .addParagraph(`<pre>${output}</pre>`)
    .setOptions({
      fullPage: true,
      css: /* css */ `
          pre{
            background-color: transparent;
          }
        `
    })
    .loadPage(title);
}