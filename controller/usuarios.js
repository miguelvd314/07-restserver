const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');
const { validationResult } = require('express-validator');
const { emailExiste } = require('../helpers/db-validators');

const usuariosGet = async (req = request, res = response) => {
    const { limite = 5, desde = 0 } = req.query; // Indicamos que vamos a recibir un parámetro: limite, con valor por defecto 5
    const query = { estado: true };

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query), // Retorna total
        Usuario.find(query) // Retorna los usuarios
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.json({
        total,
        usuarios
    });
    // Encuentra desde al límite registros de la DB
    /* const usuarios = await Usuario.find(query)
        .skip(Number(desde))
        .limit(Number(limite));
    const total = await Usuario.countDocuments(query); */
};

const usuariosPut = async (req, res = response) => {
    const { id } = req.params;
    // Excluyo password, google y correo (no se actualizan) y todo lo demás lo almaceno en resto
    const { _id,password, google, correo, ...resto } = req.body;

    // POR HACER: Validar id contra la DB

    if (password) {
        // Encriptar la contraseña en caso que venga en el body
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync(password);
    }

    // Actualiza el registro: lo busca por id y actualiza con los valores de resto
    const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

    res.json({
        msg: 'put API - controller',
        usuario,
    });
};

const usuariosPost = async (req, res = response) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json(errores);
    }

    const { nombre, correo, password, rol } = req.body;
    const usuario = new Usuario({ nombre, correo, password, rol });

    // Verificar si existe correo
    // Verificar si existe correo utilizando la función emailExiste
    try {
        await emailExiste(correo);
    } catch (error) {
        return res.status(400).json({
            msg: error.message
        });
    }

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync(); // Cantidad de vueltas que hará la encriptación (por defecto 10)
    usuario.password = bcryptjs.hashSync(password, salt); // Encripta la contraseña

    await usuario.save(); // Esto es para grabar en BD

    res.json({
        msg: 'post API - controller',
        usuario
    });
};

const usuariosDelete = async (req, res = response) => {
    const { id } = req.params;

    // Borrado físico.
    // const usuario = await Usuario.findByIdAndDelete(id);

    // Borrado lógico:
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.json({
        usuario
    });
};

const usuariosPatch = (req, res = response) => {
    res.json({
        msg: 'patch API - controller'
    });
};

// Se exporta un objeto ya que habrá muchos controladores
module.exports = {
    usuariosGet,
    usuariosPut,
    usuariosPost,
    usuariosDelete,
    usuariosPatch
};
