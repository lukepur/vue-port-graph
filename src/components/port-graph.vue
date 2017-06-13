<template>
  <div class="">
    <h2>PortGraph</h2>
    {{ graphConfig }}
  </div>
</template>

<script>
export default {
  name: 'PortGraph',
  props: {
    graphConfig: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
</style>
