import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      auth: {
        login_title: 'Bienvenido de nuevo',
        login_subtitle: 'Ingresa tus credenciales para acceder',
        register_title: 'Crea tu cuenta',
        register_subtitle: 'Únete a la comunidad de A-Darts',
        email_label: 'Correo electrónico',
        password_label: 'Contraseña',
        alias_label: 'Alias',
        login_btn: 'Iniciar sesión',
        register_btn: 'Registrarse',
        logging_in: 'Iniciando sesión...',
        creating_account: 'Creando cuenta...',
        no_account: '¿No tienes una cuenta?',
        have_account: '¿Ya tienes una cuenta?',
        signup_link: 'Regístrate',
        login_link: 'Inicia sesión',
        login_success: 'Inicio de sesión exitoso',
        register_success: 'Registro exitoso',
        logout_success: 'Sesión cerrada correctamente',
        errors: {
          'Invalid credentials': 'Credenciales inválidas',
          'Email already in use': 'Ya existe un usuario con ese correo',
          'Internal server error': 'Error interno del servidor. Inténtalo de nuevo más tarde',
          'Default': 'Ha ocurrido un error inesperado'
        }
      },
      common: {
        loading: 'Cargando...',
        error: 'Error'
      }
    }
  },
  en: {
    translation: {
      auth: {
        login_title: 'Welcome back',
        login_subtitle: 'Enter your credentials to access',
        register_title: 'Create your account',
        register_subtitle: 'Join the A-Darts community',
        email_label: 'Email address',
        password_label: 'Password',
        alias_label: 'Alias',
        login_btn: 'Log In',
        register_btn: 'Sign Up',
        logging_in: 'Logging in...',
        creating_account: 'Creating account...',
        no_account: "Don't have an account?",
        have_account: 'Already have an account?',
        signup_link: 'Sign Up',
        login_link: 'Log In',
        login_success: 'Login successful',
        register_success: 'Registration successful',
        logout_success: 'Logged out successfully',
        errors: {
          'Invalid credentials': 'Invalid credentials',
          'Email already in use': 'Email already in use',
          'Internal server error': 'Internal server error. Please try again later',
          'Default': 'An unexpected error occurred'
        }
      },
      common: {
        loading: 'Loading...',
        error: 'Error'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Force Spanish
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
