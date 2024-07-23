<template>
  <div v-if="headers.length" class="mt-4">
    <h3 class="text-center mb-4 font-weight-bold">Mapear Colunas</h3>
    <div v-for="(header, index) in headers" :key="index" class="form-group row align-items-center mb-3">
      <label class="col-sm-3 col-form-label font-weight-semibold">{{ header }}</label>
      <div class="col-sm-9">
        <select v-model="selectedMapping[header]" class="form-control custom-select shadow-sm" @change="handleMappingChange(header, $event.target.value)">
          <option value="" disabled>Selecione uma coluna padrão</option>
          <option v-for="defaultHeader in defaultHeaders" :key="defaultHeader" :value="defaultHeader">
            {{ defaultHeader }}
          </option>
        </select>
      </div>
    </div>
    <button class="btn btn-custom mt-4" @click="downloadMappedFile">Baixar Arquivo</button>
  </div>
</template>

<script>
import { watch, shallowRef, computed } from 'vue';

export default {
  props: {
    headers: {
      type: Array,
      required: true,
      default: () => []
    },
    defaultHeaders: {
      type: Array,
      required: true,
      default: () => []
    },
    mappings: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const localMappings = shallowRef({ ...props.mappings });
    
    watch(() => props.mappings, (newMappings) => {
      Object.assign(localMappings.value, newMappings);
    }, { deep: true });

    const downloadMappedFile = () => {
      emit('download-mapped-file');
    };
    
    const selectedMapping = computed(() => {
      const result = {};
      props.headers.forEach(header => {
        result[header] = props.mappings[header] || '';
      });
      return result;
    });

    const handleMappingChange = (header, value) => {
      emit('update-mapping', { header, value });
    };

    return {
      localMappings,
      downloadMappedFile,
      selectedMapping,
      handleMappingChange
    };
  }
};
</script>

<style scoped>
/* Add your custom styles here */
.form-control.custom-select {
  border-radius: 0.375rem;
  border-color: #ced4da;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
}

.form-control.custom-select:focus {
  border-color: #ff6f00;
  box-shadow: 0 0 0 0.2rem rgba(255, 111, 0, 0.25);
}

.btn-custom {
  background-color: orange;
  color: white;
  border: none;
}

.btn-custom:hover {
  background-color: darkorange;
}

</style>
