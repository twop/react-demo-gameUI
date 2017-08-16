import { DemoComponent } from './App';
import { renderCanvas } from './BallsCrud';
import * as React from 'react';
import { DemoRender } from './DemoRender';

// tslint:disable-next-line:no-console
console.log('before render');

// tslint:disable-next-line:no-console
DemoRender.render(<DemoComponent />, DemoRender.dumpTree);

function mainloop() {
  renderCanvas();
  const tree = DemoRender.renderTreeToString().join();
  document.body.innerHTML = `<div><pre>${tree}</pre></div>`;
}

setInterval(DemoRender.dumpTree, 2000);
setInterval(mainloop, 0);