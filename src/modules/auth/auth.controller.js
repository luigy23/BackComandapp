import { register as registerService, login as loginService } from './auth.service.js';

export const register = async (req, res) => {
    try {
        const { email, password, name, roleId } = req.body;
        
        if (!email || !password || !name || !roleId) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos' 
            });
        }

        const token = await registerService({ 
            email, 
            password, 
            name,
            roleId 
        });
        
        res.status(201).json({ 
            message: 'Usuario registrado exitosamente',
            token 
        });
    } catch (error) {
        res.status(400).json({ 
            error: error.message 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        const token = await loginService(email, password);
        
        res.json({ 
            message: 'Login exitoso',
            token 
        });
    } catch (error) {
        console.log("error en el login", error);
        res.status(401).json({ 
            error: error.message 
        });
    }
}; 