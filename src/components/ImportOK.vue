<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-lg-8 offset-lg-2">
        <h2 class="text-center">Importação e mapeamento de colunas</h2>
        <div class="form-group mb-4">
          <label for="fileUpload">Carregar Arquivo</label>
          <input
            type="file"
            id="fileUpload"
            class="form-control-file"
            @change="handleFileUpload"
          />
        </div>
        <div v-if="defaultHeaderSets.length" class="form-group mb-4">
          <label for="defaultHeadersSelect">Selecionar Modelo</label>
          <select
            id="defaultHeadersSelect"
            v-model="selectedDefaultHeaderSet"
            class="form-control custom-select"
            @change="updateDefaultHeaders"
          >
            <option v-for="(set, index) in defaultHeaderSets" :key="index" :value="set">
              {{ set.name }}
            </option>
          </select>
        </div>
        <div v-if="headers.length" class="mt-4">
          <h3 class="text-center">Mapear Colunas</h3>
          <div v-for="(header, index) in headers" :key="index" class="form-group row align-items-center mb-3">
            <label class="col-sm-2 col-form-label text-grey">{{ header }}</label>
            <div class="col-sm-10">
              <select v-model="mappings[header]" class="form-control custom-select">
                <option value="" disabled>Selecione uma coluna padrão</option>
                <option v-for="defaultHeader in defaultHeaders" :key="defaultHeader" :value="defaultHeader">
                  {{ defaultHeader }}
                </option>
              </select>
            </div>
          </div>
          <button class="btn btn-custom mt-4" @click="downloadMappedFile">Baixar Arquivo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import * as XLSX from 'xlsx';

export default {
  setup() {
    const headers = ref([]);
    const data = ref([]);
    const defaultHeaderSets = ref([
      { name: 'Cliente', headers: ['ID do Cliente', 'Dia de vencimento', 'Razão social ou Nome completo', 'Nome fantasia', 'Pronuncia','Data de nascimento ou fundacao'
      ,'CNPJ','CPF','RG', 'Orgao expedidor','E-mail de financeiro','E-mail de recado','Telefone','Celular','DDR','Ramal exclusivo','Caixa postal',
      'Rua','Numero','Complemento','Bairro', 'CEP','Cidade','Estado(UF)','Pais','Rua de correspondencia','Numero de correspondencia', 'Complemento de correspondencia',
      'Bairro de correspondencia','CEP de correspondencia', 'Cidade de correspondencia','Cidade de correspondencia','Estado (UF) de correspondencia',
      'Passaporte', 'Multa por atraso%','Juros por dia%','Dias de atraso para bloqueio','Rententor ISS','Inscricao Municipal','Inscricao Estadual',
      'Site','Ramo de atividade','Observacoes','Apresentacao','Descricao de produtos e servicos','Profissao', 'Estado civil','Data de nascimento', 'ID da Unidade'] },
      { name: 'Pessoa', headers: ['ID do Cliente', 'Nome', 'Assina pela empresa?', 'E-mail', 'Telefone','Celular','Ramal exclusivo','Pode retirar correspondência?',
        'Rua','Numero','Complemento','Bairro','CEP','Estado','Pais','RG','Órgão Expedidor','CPF','Data de nascimento','Sexo','Estado Civil','Nacionalidade',
        'Naturalidade','Passaporte','Observacoes','Profissao','Cargo','Ativo','ID da Unidade'
      ] },
      { name: 'Fornecedor', headers: ['Nome ou Nome Fantasia', 'Razão social', 'CNPJ', 'CPF', 'RG','Orgao expedidor','Celular','Telefone','E-mails',
        'Rua','Numero','Complemento','Bairro','CEP','Cidade','Estado (UF)','Inscricao Municipal','Inscricao Estadual','Site','Ramo de atividade',
        'Pessoas de contato','Observacoes','Data de cadastro']},
      { name: 'Contrato', headers: ['ID', 'ID CLIENTE', 'ID DO PLANO', 'NOME DO PLANO PERSONALIZADO', 'PERIODICIDADE DO PAGAMENTO', 'DATA DE INÍCIO',
        'DATA DE ENCERRAMENTO','DATA DA FIDELIDADE','DESCRIÇÃO RESUMIDA DO CONTRATO','OBSERVACOES','ID DA SALA PRIVATIVA','VALOR ORIGINAL','VALOR FINAL',
        'USAR PRO RATA','GERAR VENDAS A PARTIR DE','VALOR DA TAXA DE ADESAO','DESCONTO EM SALAS (%)','DESCONTO EM ESTAÇÕES DE TRABALHO (%)','QTD LIMITE DE ATENDIMENTOS',
        'PRECO POR ATENDIMENTO ADICIONAL','HABILITAR ENVIO DE SMS','ID DO CENTRO DE CUSTO','ID DA CATEGORIA DE SERVIÇO','ID DA UNIDADE'
      ] },
    ]);
    const selectedDefaultHeaderSet = ref([]);
    const defaultHeaders = ref([]);
    const mappings = reactive({});

     watch(selectedDefaultHeaderSet, (newSet) => {
      defaultHeaders.value = newSet;
      updateMappings();
    });

     const updateMappings = () => {
      headers.value.forEach(header => {
        if (!(header in mappings)) {
          mappings[header] = '';
        }
      });
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataValue = new Uint8Array(e.target.result);
        const workBook = XLSX.read(dataValue, { type: 'array' });
        const sheetName = workBook.SheetNames[0];
        const workSheet = workBook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
        headers.value = json[1];
        data.value = json.slice(2);

        updateMappings();
      };
      reader.readAsArrayBuffer(file);
    };

    const downloadMappedFile = () => {

      const mappedData = data.value.map(row => {
        const newRow = {};
        headers.value.forEach((originalHeader, index) => {
          const newHeader = mappings[originalHeader];
          if (newHeader) {
            newRow[newHeader] = row[index];
          }
        });
        return newRow;
      });

      if (mappedData.length === 0) {
        console.error('No data to map.');
        return;
      }

      const workSheet = XLSX.utils.json_to_sheet(mappedData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, workSheet, 'Importacao mapeada');
      XLSX.writeFile(newWorkbook, 'importacao_mapeada.xlsx');
    };

     const updateDefaultHeaders = () => {
        const selectedSet = defaultHeaderSets.value.find(set => {
        return set.name === selectedDefaultHeaderSet.value.name
      });
      if (selectedSet) {
        defaultHeaders.value = selectedSet.headers;
        updateMappings();
      }
    };

    return {
      headers,
      data,
      defaultHeaders,
      mappings,
      handleFileUpload,
      defaultHeaderSets,
      selectedDefaultHeaderSet,
      downloadMappedFile,
    updateDefaultHeaders,
      updateMappings
    };
  }
};
</script>

<style scoped>
/* Add your custom styles here */
.container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
}

.btn-custom {
  background-color: orange;
  color: white;
  border: none;
}

.btn-custom:hover {
  background-color: darkorange;
}

.btn-custom:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 165, 0, 0.25);
}

.form-control,
.custom-select {
  border: 1px solid grey;
  border-radius: 4px;
}

.form-control:focus,
.custom-select:focus {
  border-color: orange;
  box-shadow: 0 0 0 0.2rem rgba(255, 165, 0, 0.25);
}

.form-control:hover,
.custom-select:hover {
  border-color: orange;
}
.btn-custom {
  background-color: orange;
  color: white;
}

.btn-custom:hover {
  background-color: darkorange;
}

.form-control {
  border-color: orange;
}

.form-control:focus {
  border-color: orange;
  box-shadow: 0 0 0 0.2rem rgba(255, 165, 0, 0.25);
}

.custom-select:hover {
  border-color: orange;
}

.custom-select:focus {
  border-color: orange;
  box-shadow: 0 0 0 0.2rem rgba(255, 165, 0, 0.25);
}
</style>
