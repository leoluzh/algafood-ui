<template>
	<div class="p-grid crud-demo">
		<div class="p-col-12">
			<div class="card">
				<Toast/>
				<Toolbar class="p-mb-4">
					<template slot="left">
						<Button label="New" icon="pi pi-plus" class="p-button-success p-mr-2" @click="openNew" />
						<Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedUsuarios || !selectedUsuarios.length" />
					</template>

					<template slot="right">
						<FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="p-mr-2 p-d-inline-block" />
						<Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)"  />
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="usuarios" :selection.sync="selectedUsuarios" dataKey="id" :paginator="true" :rows="10" :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]"
                            currentPageReportTemplate="Exibindo {first} de {last} para {totalRecords} usuários">
					<template #header>
						<div class="table-header">
							<h5 class="p-m-0">Administrar Usuários</h5>
							<span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global']" placeholder="Pesquisar..." />
                            </span>
						</div>
					</template>

					<Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
					<Column field="id" header="Id" sortable></Column>
					<Column field="username" header="Username" sortable></Column>
					<Column field="email" header="Email" sortable></Column>
					<Column field="dataCadastro" header="Data de Cadastro" sortable></Column>
					<Column field="dataAtualizacao" header="Data de Atualização" sortable></Column>
					<Column header="Image">
						<template #body="slotProps">
							<img :src="'assets/layout/images/product/' + slotProps.data.image" :alt="slotProps.data.image" class="product-image" />
						</template>
					</Column>
					<Column field="price" header="Price" sortable>
						<template #body="slotProps">
							{{formatCurrency(slotProps.data.price)}}
						</template>
					</Column>
					<Column field="category" header="Category" sortable></Column>
					<Column>
						<template #body="slotProps">
							<Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2" @click="editProduct(slotProps.data)" />
							<Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteProduct(slotProps.data)" />
						</template>
					</Column>
				</DataTable>

				<Dialog :visible.sync="productDialog" :style="{width: '450px'}" header="Product Details" :modal="true" class="p-fluid">
					<img :src="'assets/layout/images/product/' + product.image" :alt="product.image" class="product-image" v-if="product.image" />
					<div class="p-field">
						<label for="name">Name</label>
						<InputText id="name" v-model.trim="product.name" required="true" autofocus :class="{'p-invalid': submitted && !product.name}" />
						<small class="p-invalid" v-if="submitted && !product.name">Name is required.</small>
					</div>
					<div class="p-field">
						<label for="description">Description</label>
						<Textarea id="description" v-model="product.description" required="true" rows="3" cols="20" />
					</div>

					<div class="p-field">
						<label class="p-mb-3">Category</label>
						<div class="p-formgrid p-grid">
							<div class="p-field-radiobutton p-col-6">
								<RadioButton id="category1" name="category" value="Accessories" v-model="product.category" />
								<label for="category1">Accessories</label>
							</div>
							<div class="p-field-radiobutton p-col-6">
								<RadioButton id="category2" name="category" value="Clothing" v-model="product.category" />
								<label for="category2">Clothing</label>
							</div>
							<div class="p-field-radiobutton p-col-6">
								<RadioButton id="category3" name="category" value="Electronics" v-model="product.category" />
								<label for="category3">Electronics</label>
							</div>
							<div class="p-field-radiobutton p-col-6">
								<RadioButton id="category4" name="category" value="Fitness" v-model="product.category" />
								<label for="category4">Fitness</label>
							</div>
						</div>
					</div>

					<div class="p-formgrid p-grid">
						<div class="p-field p-col">
							<label for="price">Price</label>
							<InputNumber id="price" v-model="product.price" mode="currency" currency="USD" locale="en-US" />
						</div>
						<div class="p-field p-col">
							<label for="quantity">Quantity</label>
							<InputNumber id="quantity" v-model="product.quantity" integeronly />
						</div>
					</div>
					<template #footer>
						<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
					</template>
				</Dialog>

				<Dialog :visible.sync="deleteProductDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="confirmation-content">
						<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
						<span v-if="product">Are you sure you want to delete <b>{{product.name}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
					</template>
				</Dialog>

				<Dialog :visible.sync="deleteProductsDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="confirmation-content">
						<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
						<span v-if="product">Are you sure you want to delete the selected products?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
					</template>
				</Dialog>
			</div>
		</div>
	</div>

</template>

<script>
import UsuarioService from '../service/UsuarioService';

export default {
	data() {
		return {
			usuarios: null,
			usuarioDialog: false,
			deleteUsuarioDialog: false,
			deleteUsuariosDialog: false,
			usuario: {},
			selectedUsuarios: null,
			filters: {},
			submitted: false
		}
	},
	usuarioService: null,
	created() {
		this.usuarioService = new UsuarioService();
	},
	mounted() {
		this.usuarioService.getUsuarios().then(data => this.usuarios = data);
	},
	methods: {
		formatCurrency(value) {
			return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        },
		openNew() {
			this.usuario = {};
			this.submitted = false;
			this.usuarioDialog = true;
		},
		hideDialog() {
			this.usuarioDialog = false;
			this.submitted = false;
		},
		saveUsuario() {
			this.submitted = true;

			if (this.usuario.username.trim()) {
				if (this.usuario.id) {
					this.$set(this.usuarios, this.findIndexById(this.usuario.id), this.usuario);
					this.$toast.add({severity:'success', summary: 'Successful', detail: 'Usuário Atualizado', life: 3000});
				}
				else {
					this.usuario.id = this.createId();
					this.usuarios.push(this.usuario);
					this.$toast.add({severity:'success', summary: 'Successful', detail: 'Usuário Criado', life: 3000});
				}

				this.usuarioDialog = false;
				this.usuario = {};
			}
		},
		editUsuario(usuario) {
			this.usuario = {...usuario};
			this.usuarioDialog = true;
		},
		confirmDeleteUsuario(usuario) {
			this.usuario = usuario;
			this.deleteUsuarioDialog = true;
		},
		deleteUsuario() {
			this.usuarios = this.usuarios.filter(val => val.id !== this.usuario.id);
			this.deleteProductDialog = false;
			this.usuario = {};
			this.$toast.add({severity:'success', summary: 'Successful', detail: 'Usuário Excluído', life: 3000});
		},
		findIndexById(id) {
			let index = -1;
			for (let i = 0; i < this.usuarios.length; i++) {
				if (this.usuarios[i].id === id) {
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
			this.deleteUsuariosDialog = true;
		},
		deleteSelectedUsuarios() {
			this.usuarios = this.usuarios.filter(val => !this.selectedUsuarios.includes(val));
			this.deleteUsuariosDialog = false;
			this.selectedUsuarios = null;
			this.$toast.add({severity:'success', summary: 'Successful', detail: 'Usuários Excluídos', life: 3000});
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

.product-image {
	width: 100px;
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.p-dialog .product-image {
	width: 150px;
	margin: 0 auto 2rem auto;
	display: block;
}

.confirmation-content {
	display: flex;
	align-items: center;
	justify-content: center;
}

.product-badge {
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
