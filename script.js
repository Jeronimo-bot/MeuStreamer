// script.js

// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDORAClqJ-Zmp9zmp4SWJRnRZu6ndDgNOc",
    authDomain: "stream-ac614.firebaseapp.com",
    projectId: "stream-ac614",
    storageBucket: "stream-ac614.appspot.com",
    messagingSenderId: "230884044847",
    appId: "1:230884044847:web:6f0b1f1b85da09174556da"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Variável para armazenar o usuário atual e os vídeos salvos
let currentUser = null;
let savedVideos = [];

// Verificar se o usuário está autenticado
onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname;

    if (user) {
        currentUser = user;
        if (currentPage.includes('login.html')) {
            window.location.href = 'index.html';
        } else {
            // Carregar dados do usuário
            await initializeUserData(user);
            // Obter vídeos salvos
            await loadSavedVideos(user.uid);
            // Atualizar botões de salvar/remover
            updateSaveButtons();
            // Definir imagem de perfil
            setProfileImage(user);
        }
    } else {
        currentUser = null;
        if (!currentPage.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Inicializar dados do usuário no Firestore
async function initializeUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Se o documento não existir, crie um novo
        await setDoc(userRef, {
            savedVideos: []
        });
    }
}

// Função para carregar vídeos salvos
async function loadSavedVideos(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        savedVideos = userSnap.data().savedVideos || [];
    }
}

// Função para atualizar os botões de salvar/remover
function updateSaveButtons() {
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
        const videoId = button.parentElement.getAttribute('data-video-id');
        if (savedVideos.includes(videoId)) {
            button.textContent = 'Remover';
            button.classList.add('remove');
        } else {
            button.textContent = 'Salvar';
            button.classList.remove('remove');
        }
    });
}

// Definir imagem de perfil
function setProfileImage(user) {
    const profileIcon = document.getElementById('profile-icon');
    if (user.photoURL) {
        profileIcon.src = user.photoURL;
    } else {
        profileIcon.src = 'default-profile-icon.png'; // Forneça uma imagem padrão, se desejar
    }
}

// Lógica para login.html
if (document.getElementById('login-btn')) {
    document.getElementById('login-btn').addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erro ao fazer login:', error);
        }
    });
}

// Lógica para index.html
if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
        });
    });

    // Função para aplicar os filtros de gênero e busca
    const genreSelect = document.getElementById('genre-select');
    const searchBar = document.getElementById('search-bar');

    function applyFilters() {
        const selectedGenre = genreSelect.value.toLowerCase();
        const searchTerm = searchBar.value.toLowerCase();
        const videoItems = document.querySelectorAll('.video-item');

        videoItems.forEach(item => {
            const itemGenre = item.getAttribute('data-genre').toLowerCase();
            const title = item.getAttribute('data-title').toLowerCase();

            const genreMatch = selectedGenre === '' || itemGenre === selectedGenre;
            const searchMatch = title.includes(searchTerm);

            if (genreMatch && searchMatch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    genreSelect.addEventListener('change', applyFilters);
    searchBar.addEventListener('input', applyFilters);

    // Lógica para abrir o player em uma nova página
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach(item => {
        item.addEventListener('click', function(event) {
            if (event.target.classList.contains('save-btn')) return;
            const videoId = this.getAttribute('data-video-id');
            // Redireciona para player.html com o ID do vídeo na query string
            window.location.href = `player.html?videoId=${videoId}`;
        });
    });

    // Lógica para salvar ou remover vídeos
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
        button.addEventListener('click', async function(event) {
            event.stopPropagation(); // Impede a propagação do clique para o item do vídeo
            if (!currentUser) return;
            const videoId = this.parentElement.getAttribute('data-video-id');
            const userRef = doc(db, "users", currentUser.uid);

            if (savedVideos.includes(videoId)) {
                // Remover vídeo
                await updateDoc(userRef, {
                    savedVideos: arrayRemove(videoId)
                });
                savedVideos = savedVideos.filter(id => id !== videoId);
                this.textContent = 'Salvar';
                this.classList.remove('remove');
            } else {
                // Salvar vídeo
                await updateDoc(userRef, {
                    savedVideos: arrayUnion(videoId)
                });
                savedVideos.push(videoId);
                this.textContent = 'Remover';
                this.classList.add('remove');
            }
        });
    });

    // Navegação para a página de perfil
    document.getElementById('profile-icon').addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
}
