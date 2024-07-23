<template>
    <div v-if="defaultHeaderSets.length" class="form-group mb-4">
        <label for="defaultHeaderSelect" class="font-weight-bold text-dark">Selecionar Modelo</label>
        <select
             id="defaultHeadersSelect"
            v-model="localSelectedDefaultHeaderSet"
            class="form-control custom-select shadow-sm"
            @change="onHeaderSetChange"
        >
            <option value="" disabled selected>Selecione um modelo</option>
            <option v-for="set in defaultHeaderSets" :key="set.name" :value="set">
                {{ set.name }}
            </option>
        </select>
    </div>
</template>
<script>
    export default {
        props: {
            defaultHeaderSets: {
                type: Array,
                required: true
            },
            selectedDefaultHeaderSet: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                localSelectedDefaultHeaderSet: this.selectedDefaultHeaderSet
            };
        },
        watch: {
            selectedDefaultHeaderSet(newVal) {
                this.localSelectedDefaultHeaderSet = newVal;
            },
            localSelectedDefaultHeaderSet(newVal) {
                 this.$emit('header-set-change', newVal);
            }
        },
        emits: ['header-set-change'],
        // methods: {
        //     onHeaderSetChange() {
        //         console.log(this.defaultHeaderSets);
        //         console.log(event.target.value.name);
        //         const selectedSet = this.defaultHeaderSets.find(set => set.name === event.target.value);
        //         console.log(selectedSet);
        //         this.localSelectedDefaultHeaderSet = selectedSet;
        //         this.$emit('header-set-change', selectedSet);
        //     }
        // }
    }
</script>
<style scoped>
.form-control.custom-select:focus {
  border-color: #ff6f00;
  box-shadow: 0 0 0 0.2rem rgba(255, 111, 0, 0.25);
}
</style>