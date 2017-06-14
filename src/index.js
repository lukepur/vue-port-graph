import Edge from './components/edge.vue'
import Node from './components/node.vue'
import Port from './components/port.vue'
import PortGraph from './components/port-graph.vue'

// Install the components
export function install (Vue) {
  Vue.component('edge', Edge)
  Vue.component('node', Node)
  Vue.component('port', Port)
  Vue.component('port-group', PortGraph)
  /* -- Add more components here -- */
}

// Expose the components
export {
  Edge,
  Node,
  Port,
  PortGraph
  /* -- Add more components here -- */
}

/* -- Plugin definition & Auto-install -- */
/* You shouldn't have to modify the code below */

// Plugin
const plugin = {
  /* eslint-disable no-undef */
  version: VERSION,
  install
}

export default plugin

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}
