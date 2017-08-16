import { DemoComponent } from './App';
import { renderCanvas } from './BallsCrud';
import * as React from 'react';
import { DemoRender } from './DemoRender';

// tslint:disable-next-line:no-console
console.log('before render');

// tslint:disable-next-line:no-console
DemoRender.render(<DemoComponent />, DemoRender.dumpTree);

const isOnWeb: boolean = global.hasOwnProperty('document');

function mainloop() {
  if (isOnWeb) {
    const tree = DemoRender.renderTreeToString().join();
    document.body.innerHTML = `<div><pre>${tree}</pre></div>`;
  } else {
    renderCanvas();
  }
}

setInterval(DemoRender.dumpTree, 2000);
setInterval(mainloop, 0);