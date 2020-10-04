import axios from 'axios'

export default class UsuarioService {

    getURI(){
        return "http://localhost:8080/algafoods/usuarios/v1/";
    }


    getUsuarios() {
        return axios.get(`${this.getURI()}`).then(res => res.data.data);
    }

    getUsuarioById( id ) {
        return axios.get(`${this.getURI()}/${id}`).then(res => res.data.data);
    }

    deleteUsuarioById( id ) {
        return axios.delete(`${this.getURI()}/${id}`).then(res => res.data.data);
    }

    updateUsuario( usuario ){
        return axios.post(`${this.getURI()}/${id}`,{ data: usuario }).then(res => res.data.data);       
    }


}
