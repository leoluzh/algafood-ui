module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? '/algafood-ui' : '/' ,
	devServer: {
		proxy: 'http://localhost:8080'
	}
}