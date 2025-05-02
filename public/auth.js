// Importar los SDK necesarios
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
    getAuth,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Configura tu proyecto Firebase (sustituye por tus claves)
const firebaseConfig = {
    apiKey: "AIzaSyC7vLTe9Pd9qZXo9-JSbRzvn9ilESFNEPc",
    authDomain: "paresactivity.firebaseapp.com",
    projectId: "paresactivity",
    storageBucket: "paresactivity.firebasestorage.app",
    messagingSenderId: "772924170776",
    appId: "1:772924170776:web:f39784e202ddaffec2d96d",
    measurementId: "G-3THNT1T97S"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Elementos DOM
const loginSection = document.getElementById('loginSection');
const evaluationSection = document.getElementById('evaluationSection');

// Exportar objeto userData para ser usado por game.js
export const userData = {};

// Función para mostrar la evaluación cognitiva
function showEvaluation() {
    // Animación de desvanecimiento para la sección de login
    loginSection.style.opacity = '0';

    // Después de la animación, ocultar login y mostrar evaluación
    setTimeout(() => {
        loginSection.style.display = 'none';
        evaluationSection.style.display = 'flex';
    }, 500);
}

// Manejo de estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.isAnonymous) {
            // Verificar si es la primera vez que entra
            const isFirstVisit = sessionStorage.getItem("firstVisit");

            if (!isFirstVisit) {
                // Guardar la bandera en sessionStorage para futuras recargas en esta sesión
                sessionStorage.setItem("firstVisit", "true");

                // Mostrar evaluación solo si es la primera visita
                userData.uid = user.uid;
                userData.email = "anonimo";
                userData.metodo_autenticacion = "anonimo";
                console.log("Usuario autenticado como ANÓNIMO");
                showEvaluation();
            } else {
                // Si ya había una sesión previa anónima, forzar logout
                console.log("Sesión anónima previa detectada. Cerrando sesión...");
                auth.signOut();
            }
        } else {
            // Usuario autenticado con Google
            userData.uid = user.uid;
            userData.email = user.email;
            userData.metodo_autenticacion = "google";
            console.log("Usuario autenticado con Google");
            showEvaluation();
        }
    } else {
        console.log("No hay usuario autenticado");
        // Mostrar login
        loginSection.style.opacity = '1';
        loginSection.style.display = 'flex';
        evaluationSection.style.display = 'none';
    }
});


// Función para login anónimo
window.loginAnonimo = () => {
    // Desactivar botones durante el proceso de login
    document.querySelectorAll('.login-buttons button').forEach(btn => {
        btn.disabled = true;
    });

    const btnAnonimo = document.querySelector('.btn-anonymous');
    const btnGoogle = document.querySelector('.btn-google');

    btnAnonimo.innerHTML = 'Cargando...';
    btnAnonimo.style.opacity = '0.7';

    signInAnonymously(auth)
        .then(() => {
            console.log("Login anónimo exitoso");
        })
        .catch((error) => {
            console.error("Error en login anónimo:", error);
            // Reactivar botones en caso de error
            document.querySelectorAll('.login-buttons button').forEach(btn => {
                btn.disabled = false;
            });
            btnAnonimo.textContent = 'Ingresar como Anónimo';
            btnAnonimo.style.opacity = '1';
        });
};

// Función para login con Google
window.loginGoogle = () => {
    // Desactivar botones durante el proceso de login
    document.querySelectorAll('.login-buttons button').forEach(btn => {
        btn.disabled = true;
    });

    const btnAnonimo = document.querySelector('.btn-anonymous');
    const btnGoogle = document.querySelector('.btn-google');

    const originalGoogleContent = btnGoogle.innerHTML;
    btnGoogle.innerHTML = 'Cargando...';
    btnGoogle.style.opacity = '0.7';

    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Login Google exitoso:", result.user.displayName);
        })
        .catch((error) => {
            console.error("Error en login con Google:", error);
            // Reactivar botones en caso de error
            document.querySelectorAll('.login-buttons button').forEach(btn => {
                btn.disabled = false;
            });
            btnGoogle.innerHTML = originalGoogleContent;
            btnGoogle.style.opacity = '1';
        });
};