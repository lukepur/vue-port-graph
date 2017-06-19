<template>
  <div>
    <Child :test="test" :onClick="handleClick"/>
  </div>
</template>

<script>
export default {
  name: 'prop-mutate-test',
  data () {
    return {
      test: {
        a: ['a', 'b'],
        b: [1, 2]
      }
    };
  },
  methods: {
    handleClick () {
      this.test = {
        a: ['c', 'd'],
        b: [Math.random(), Math.random()]
      }
    }
  },
  components: {
    Child: {
      name: 'child',
      props: {
        test: {
          type: Object,
          default: () => ({ a: [], b: [] })
        },
        onClick: {
          type: Function,
          default: () => {}
        }
      },
      methods: {
        handleClick () {
          this.onClick();
        }
      },
      template: '<div><div>{{ JSON.stringify(test) }}</div><button @click="handleClick">Click me</button></div>'
    }
  }
}
</script>
