<template>
    <div>
        <input type="file" @change="handleFileUpload" />
        <div v-if="headers.length">
            <h3>Mapear Colunas</h3>
            <div v-for="(header, index) in headers" :key="index">
                <label>{{ header }}</label>
                <select v-model="mappings[header]">
                    <option v-for="defaultHeader in defaultHeaders" :key="defaultHeader" :value="defaultHeader">
                        {{defaultHeader}}
                    </option>
                </select>
            </div>
            <button @click="downloadMappedFile">Baixar Arquivo</button>
        </div>
    </div>
</template>

<script> 
    import * as XLSX from 'xlsx';

    export default {
        data(){
            return {
                headers:[],
                data:[],
                defaultHeaders:['Id','Nome','email', 'endereco','plano', 'emiteNotaFiscal', 'telefone', 'situacao', 'dataCriacao', 'dataAtualizacao'],
                mappings:{}
            }
        },
        methods: {
            handleFileUpload(event) {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workBook = XLSX.read(data, {type: 'array'});
                    const sheetName = workBook.SheetNames[0];
                    const workSheet = workBook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(workSheet, {header: 1});

                    this.headers = json[0];
                    this.data = json.slice(1);
                    this.headers.forEach(header => {
                        this.$set(this.mappings, header, '');
                    });
                };
                reader.readAsArrayBuffer(file);
            },
            downloadMappedFile() {
                const mappedData = this.data.map(row => {
                    const newRow ={};
                    Object.keys(this.mappings).forEach(originalHeader => {
                        const newHeader = this.mappings[originalHeader];
                        if(newHeader){
                            newRow[newHeader] = row[this.headers.indexOf(originalHeader)];
                        }
                    });
                    return newRow;
                });

                const workSheet = XLSX.utils.json_to_sheet(mappedData);
                const newWorkbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(newWorkbook, workSheet, 'Importacao mapeada');
                XLSX.writeFile(newWorkbook, 'importacao_mapeada.xlsx');
            }
        }
    }
</script>