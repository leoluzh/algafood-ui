<template>
	<div class="p-grid crud-demo">
		<div class="p-col-12">
			<div class="card">
				<Toast/>
				<Toolbar class="p-mb-4">
					<template slot="left">
						<Button label="Novo" icon="pi pi-plus" class="p-button-success p-mr-2" @click="openNew" />
						<Button label="Excluir" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedEstados || !selectedEstados.length" />
					</template>

					<template slot="right">
						<FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Importar" class="p-mr-2 p-d-inline-block" />
						<Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)"  />
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="estados" :selection.sync="selectedEstados" dataKey="id" :paginator="true" :rows="10" :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} estados">
					<template #header>
						<div class="table-header">
							<h5 class="p-m-0">Adminstrar Estados</h5>
							<span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global']" placeholder="Search..." />
                            </span>
						</div>
					</template>

					<Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
					<Column field="nome" header="Nome" sortable></Column>
					<Column field="sigla" header="Sigla" sortable></Column>
					<Column field="codigoIbge" header="Código IBGE" sortable></Column>
				</DataTable>

				<Dialog :visible.sync="estadoDialog" :style="{width: '450px'}" header="Estado Details" :modal="true" class="p-fluid">

					<div class="p-field">
						<label for="name">Nome</label>
						<InputText id="nome" v-model.trim="estado.nome" required="true" autofocus :class="{'p-invalid': submitted && !estado.nome}" />
						<small class="p-invalid" v-if="submitted && !estado.nome">Nome é obrigatório.</small>
					</div>

					<div class="p-field">
						<label for="name">Sigla</label>
						<InputText id="sigla" v-model.trim="estado.sigla" required="true" autofocus :class="{'p-invalid': submitted && !estado.sigla}" />
						<small class="p-invalid" v-if="submitted && !estado.sigla">Sigla é obrigatório.</small>
					</div>

					<div class="p-field">
						<label for="name">Código IBGE</label>
						<InputText id="codigoIbge" v-model.trim="estado.codigoIbge" required="true" autofocus :class="{'p-invalid': submitted && !estado.codigoIbge}" />
						<small class="p-invalid" v-if="submitted && !estado.codigoIbge">Código IBGE é obrigatório.</small>
					</div>

					<template #footer>
						<Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="Salvar" icon="pi pi-check" class="p-button-text" @click="saveEstado" />
					</template>

				</Dialog>

				<Dialog :visible.sync="deleteEstadoDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="confirmation-content">
						<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
						<span v-if="estado">Você tem certeza que deseja excluir o estado <b>{{estado.nome}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteEstadoDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteEstado" />
					</template>
				</Dialog>

				<Dialog :visible.sync="deleteEstadosDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="confirmation-content">
						<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
						<span v-if="estado">Você tem certeza que deseja excluir os estados selecionados?</span>
					</div>
					<template #footer>
						<Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteEstadosDialog = false"/>
						<Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedEstados" />
					</template>
				</Dialog>
			</div>
		</div>
	</div>

</template>

<script>
import EstadoService from '../service/EstadoService';

export default {
	data() {
		return {
			estados: null,
			estadoDialog: false,
			deleteEstadoDialog: false,
			deleteEstadosDialog: false,
			estado: {},
			selectedEstados: null,
			filters: {},
			submitted: false
		}
	},
	estadoService: null,
	created() {
		this.estadoService = new EstadoService();
	},
	mounted() {
		this.estadoService.getEstados().then(data => this.estados = data);
	},
	methods: {
		formatCurrency(value) {
			return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
		},
		openNew() {
			this.estado = {};
			this.submitted = false;
			this.estadoDialog = true;
		},
		hideDialog() {
			this.estadoDialog = false;
			this.submitted = false;
		},
		saveEstado() {
			this.submitted = true;

			if (this.estado.name.trim()) {
				if (this.estado.id) {
					this.$set(this.estados, this.findIndexById(this.estado.id), this.estado);
					this.$toast.add({severity:'success', summary: 'Successful', detail: 'Estado Atualizado', life: 3000});
				}
				else {
					this.estado.id = this.createId();
					this.estado.code = this.createId();
					this.estado.image = 'estado-placeholder.svg';
					this.estado.inventoryStatus = 'INSTOCK';
					this.estados.push(this.estado);
					this.$toast.add({severity:'success', summary: 'Successful', detail: 'Estado Criado', life: 3000});
				}

				this.estadoDialog = false;
				this.estado = {};
			}
		},
		editEstado(estado) {
			this.estado = {...estado};
			this.estadoDialog = true;
		},
		confirmDeleteEstado(estado) {
			this.estado = estado;
			this.deleteEstadoDialog = true;
		},
		deleteEstado() {
			this.estados = this.estados.filter(val => val.id !== this.estado.id);
			this.deleteEstadoDialog = false;
			this.estado = {};
			this.$toast.add({severity:'success', summary: 'Successful', detail: 'Estado Excluído', life: 3000});
		},
		findIndexById(id) {
			let index = -1;
			for (let i = 0; i < this.estados.length; i++) {
				if (this.estados[i].id === id) {
					index = i;
					break;
				}
			}

			return index;
		},
		createId() {
			let id = '';
			var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for ( var i = 0; i < 5; i++ ) {
				id += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return id;
		},
		exportCSV() {
			this.$refs.dt.exportCSV();
		},
		confirmDeleteSelected() {
			this.deleteEstadosDialog = true;
		},
		deleteSelectedEstados() {
			this.estados = this.estados.filter(val => !this.selectedEstados.includes(val));
			this.deleteEstadosDialog = false;
			this.selectedEstados = null;
			this.$toast.add({severity:'success', summary: 'Successful', detail: 'Estados Deleted', life: 3000});
		}
	}
}
</script>

<style scoped lang="scss">
.table-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.estado-image {
	width: 100px;
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.p-dialog .estado-image {
	width: 150px;
	margin: 0 auto 2rem auto;
	display: block;
}

.confirmation-content {
	display: flex;
	align-items: center;
	justify-content: center;
}

.estado-badge {
	border-radius: 2px;
	padding: .25em .5rem;
	text-transform: uppercase;
	font-weight: 700;
	font-size: 12px;
	letter-spacing: .3px;

	&.status-instock {
		background: #C8E6C9;
		color: #256029;
	}

	&.status-outofstock {
		background: #FFCDD2;
		color: #C63737;
	}

	&.status-lowstock {
		background: #FEEDAF;
		color: #8A5340;
	}
}
</style>
