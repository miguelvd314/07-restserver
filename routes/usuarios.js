const { Router } = require('express');
const { check } = require('express-validator');
const Role = require('../models/role');
const { esRoleValido, emailExiste, existeUsuarioPorId } = require('../helpers/db-validators');
 
const {
    usuariosGet,
    usuariosPut,
    usuariosPost,
    usuariosDelete,
    usuariosPatch
} = require('../controller/usuarios');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.get('/', usuariosGet);
router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    check('rol').custom((rol) => esRoleValido(rol)),
    validarCampos
], usuariosPut);

router.post('/', [
    check('nombre', 'El Nombre es obligatorio').not().isEmpty(),
    check('correo').custom((correo) => emailExiste(correo)),
    check('password', 'El Password es obligatorio y debe tener al menos 6 letras').isLength({ min: 6 }),
    // check('rol', 'No es un Rol válido').isIn(['ADMIN_ROLE', 'USER_ROLE']),
    check('rol').custom((rol) => esRoleValido(rol)),
    validarCampos
], usuariosPost);

router.delete('/:id', [
    check('id', 'No es un ID válido ').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], usuariosDelete);

router.patch('/', usuariosPatch);

module.exports = router;
