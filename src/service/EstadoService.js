import axios from 'axios'

export default class EstadoService {

    getEndpointURI(){
        return "http://localhost:8080/algafood/estados/v1";
    }

    getEstados() {
        return axios.get(`${this.getEndpointURI()}`).then(res => { console.log(res); return res.data; } ).catch( res => res.statusText );
    }

    getEstado( id ) {
        return axios.get(`${this.getEndpointURI()}/${id}`)
        .then(res => res.data.data)
        .catch( res => console.log(res) );
    }

    updateEstado( estado ){
        return axios.post(`${this.getEndpointURI()}`, 
        { data: estado })
        .then( res => res.data )
        .catch( res => console.log(res) );
    }

    deleteEstado( id ){
        return axios.delete(`${this.getEndpointURI()}/${id}`)
        .then( res => res.data )
        .catch( res => console.log(res) );
    }

}
