<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-custom text-light text-center py-4 rounded-top shadow-lg">
            <h2 class="font-weight-bold mb-0">Importação e mapeamento de colunas</h2>
          </div>
          <div class="card-body">
            <div class="form-group mb-4 custom-file">
              <input
                type="file"
                id="fileUpload"
                class="custom-file-input"
                @change="handleFileUpload"
              />
              <label for="fileUpload" class="custom-file-label">{{fileName || 'Carregar Arquivo'}}</label>
            </div>
            <HeaderSelect
              v-if="defaultHeaderSets.length"
              :default-header-sets="defaultHeaderSets" 
              :selected-default-header-set="selectedDefaultHeaderSet" 
              @header-set-change="updateDefaultHeaders"
            />
            <ColumnMapping 
              :headers="headers" 
              :default-headers="defaultHeaders" 
              :mappings="mappings"
              :data="data"
              @download-mapped-file="downloadMappedFile"
              @update-mapping="handleUpdateMappings"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, reactive, watch } from 'vue';
import * as XLSX from 'xlsx';
import HeaderSelect from './HeaderSelect';
import ColumnMapping from './ColumnMapping';

export default {
  components: {
    HeaderSelect,
    ColumnMapping
  },
  setup() {
    const headers = ref([]);
    const data = ref([]);
    const fileName = ref('');
    const defaultHeaderSets = ref([
      { name: 'Cliente', headers: ['ID do Cliente', 'Dia de vencimento', 'Razão social ou Nome completo', 'Nome fantasia', 'Pronuncia','Data de nascimento ou fundacao'
      ,'CNPJ','CPF','RG', 'Orgao expedidor','E-mail de financeiro','E-mail de recado','Telefone','Celular','DDR','Ramal exclusivo','Caixa postal',
      'Rua','Numero','Complemento','Bairro', 'CEP','Cidade','Estado(UF)','Pais','Rua de correspondencia','Numero de correspondencia', 'Complemento de correspondencia',
      'Bairro de correspondencia','CEP de correspondencia', 'Cidade de correspondencia','Cidade de correspondencia','Estado (UF) de correspondencia',
      'Passaporte', 'Multa por atraso%','Juros por dia%','Dias de atraso para bloqueio','Rententor ISS','Inscricao Municipal','Inscricao Estadual',
      'Site','Ramo de atividade','Observacoes','Apresentacao','Descricao de produtos e servicos','Tratamento','Orientacao para atendimento','Profissao', 'Estado civil','Data de nascimento', 'Data do cadastro','ID da Unidade']},
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
      fileName.value = file ? file.name : '';
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataValue = new Uint8Array(e.target.result);
        const workBook = XLSX.read(dataValue, { type: 'array' });
        const sheetName = workBook.SheetNames[0];
        const workSheet = workBook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
        headers.value = json[0];
        data.value = json.slice(1);

        updateMappings();
      };
      reader.readAsArrayBuffer(file);
    };

    const handleUpdateMappings = ({header, value}) => {
      mappings[header] = value
    }

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

     const updateDefaultHeaders = (SelectedHeader) => {
        const selectedSet = defaultHeaderSets.value.find(set => {
        return set.name === SelectedHeader.name
      });
      if (selectedSet) {
        defaultHeaders.value = selectedSet.headers;
        updateMappings();
      }
    };

    return {
      headers,
      data,
      fileName,
      defaultHeaders,
      mappings,
      handleFileUpload,
      defaultHeaderSets,
      selectedDefaultHeaderSet,
      downloadMappedFile,
    updateDefaultHeaders,
      updateMappings,
      handleUpdateMappings
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
.card {
  border: none;
  border-radius: 8px;
}
.card-header {
  background-color: #000000;
  color: white;
  border-bottom: none;
  padding: 1.5rem;
}

.custom-file {
  position: relative;
  display: inline-block;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  margin-bottom: 0;
}

.custom-file-input {
  position: relative;
  z-index: 2;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  margin: 0;
  opacity: 0;
}

.custom-file-label {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.custom-file-label::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  display: block;
  height: calc(1.5em + 0.75rem);
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  color: #495057;
  content: "Selecionar";
  background-color: #e9ecef;
  border-left: inherit;
  border-radius: 0 0.25rem 0.25rem 0;
}

.custom-file-input:focus ~ .custom-file-label {
  border-color: orange;
  box-shadow: 0 0 0 0.2rem rgba(255, 165, 0, 0.25);
}

.card-header.bg-custom {
  background: linear-gradient(to right, #ff6f00, #ff9e00);
  color: #fff;
}

.card-header {
  border-bottom: 0;
  border-radius: 0.25rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0;
}

.card-body {
  padding: 2rem;
}

h3 {
  font-size: 1.5rem;
  color: #333;
  font-weight: 700;
}

.col-form-label {
  font-weight: 500;
  color: #495057;
}
.form-control.custom-select {
  border-radius: 0.375rem;
  border-color: #ced4da;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
}

.form-control.custom-select:focus {
  border-color: #ff6f00;
  box-shadow: 0 0 0 0.2rem rgba(255, 111, 0, 0.25);
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .col-sm-3,
  .col-sm-9 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.form-control.custom-select {
  border-radius: 0.375rem;
  border-color: #ced4da;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
}

.form-control.custom-select:focus {
  border-color: #ff6f00;
  box-shadow: 0 0 0 0.2rem rgba(255, 111, 0, 0.25);
}

option:disabled[selected] {
  color: #6c757d;
}

@media (max-width: 767.98px) {
  .form-group {
    margin-bottom: 1rem;
  }
}
}
</style>
