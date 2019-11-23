// ----------------------------------------------------------------------
// BROWSER COMPONENT ENTRY FILE
// ----------------------------------------------------------------------

import * as components from './src/';
Object.entries(components).forEach(([name, exported]) => Vue.component(exported.name, exported));
