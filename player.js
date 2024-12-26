// player.js

// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged
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

// Variáveis globais
let currentUser = null;
let savedVideos = [];

// Verificar se o usuário está autenticado
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await initializeUserData(user);
        await loadSavedVideos(user.uid);
        loadVideo();
    } else {
        window.location.href = 'login.html';
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

// Botão Voltar - sempre redireciona para index.html
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Carregar o vídeo
async function loadVideo() {
    const videoId = getCurrentVideoId();
    if (videoId) {
        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

        // Verifica se o vídeo está salvo
        let isSaved = savedVideos.includes(videoId);
        createSaveButton(isSaved);

        // Carregar recomendações
        loadRecommendations();
    } else {
        // Se não houver videoId, redireciona para index.html
        window.location.href = 'index.html';
    }
}

// Função para obter o ID do vídeo atual
function getCurrentVideoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('videoId');
}

// Cria o botão dinamicamente
function createSaveButton(isSaved) {
    const saveBtn = document.createElement('button');
    saveBtn.id = 'save-video-btn';
    saveBtn.textContent = isSaved ? 'Remover da Lista' : 'Salvar na Lista';
    saveBtn.addEventListener('click', async () => {
        const videoId = getCurrentVideoId();
        if (isSaved) {
            await removeVideo(currentUser.uid, videoId);
            savedVideos = savedVideos.filter(id => id !== videoId);
            saveBtn.textContent = 'Salvar na Lista';
        } else {
            await saveVideo(currentUser.uid, videoId);
            savedVideos.push(videoId);
            saveBtn.textContent = 'Remover da Lista';
        }
        isSaved = !isSaved;
    });
    document.body.insertBefore(saveBtn, document.querySelector('.recommendations'));
}

// Funções saveVideo e removeVideo
async function saveVideo(userId, videoId) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        savedVideos: arrayUnion(videoId)
    });
}

async function removeVideo(userId, videoId) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        savedVideos: arrayRemove(videoId)
    });
}

// Dados dos vídeos
const videos = [
    {
        videoId: "ZZYmgwWFyDk",
        genre: "Terror",
        title: "A Casa Sinistra (1932)",
        thumbnail: "https://img.youtube.com/vi/ZZYmgwWFyDk/hqdefault.jpg"
    },
    {
        videoId: "sXMXqWSalaA",
        genre: "Aventura",
        title: "Agente Secreto (1936)",
        thumbnail: "https://img.youtube.com/vi/sXMXqWSalaA/hqdefault.jpg"
    },
    {
        videoId: "rhGcEYqo1JA",
        genre: "Aventura",
        title: "O Conde de Monte Cristo (1934)",
        thumbnail: "https://img.youtube.com/vi/rhGcEYqo1JA/hqdefault.jpg"
    },
    {
        videoId: "uL4KyzJVmu8",
        genre: "Mistério",
        title: "Barba Azul (1944)",
        thumbnail: "https://img.youtube.com/vi/uL4KyzJVmu8/hqdefault.jpg"
    },
    {
        videoId: "1TWtwdpH_ig",
        genre: "Drama",
        title: "Páginas da Vida (1952)",
        thumbnail: "https://img.youtube.com/vi/1TWtwdpH_ig/hqdefault.jpg"
    },
    {
        videoId: "0PhONRF8U70",
        genre: "Drama",
        title: "Um Retrato de Mulher (1944)",
        thumbnail: "https://img.youtube.com/vi/0PhONRF8U70/hqdefault.jpg"
    },
    {
        videoId: "HSEE0-7Tjs8",
        genre: "Mistério",
        title: "O Cão dos Baskervilles (1959)",
        thumbnail: "https://img.youtube.com/vi/HSEE0-7Tjs8/hqdefault.jpg"
    },
    {
        videoId: "1KZjQvDw2Mc",
        genre: "Mistério",
        title: "Jovem e Inocente (1937)",
        thumbnail: "https://img.youtube.com/vi/1KZjQvDw2Mc/hqdefault.jpg"
    },
    {
        videoId: "n1gNCpOKciI",
        genre: "Terror",
        title: "A Noite dos Mortos Vivos (1968)",
        thumbnail: "https://img.youtube.com/vi/n1gNCpOKciI/hqdefault.jpg"
    },
    {
        videoId: "yr0n9DWCnLw",
        genre: "Aventura",
        title: "Ulysses (1954)",
        thumbnail: "https://img.youtube.com/vi/yr0n9DWCnLw/hqdefault.jpg"
    },
    {
        videoId: "orbMHRU6CmQ",
        genre: "Terror",
        title: "Maldição (1950)",
        thumbnail: "https://img.youtube.com/vi/orbMHRU6CmQ/hqdefault.jpg"
    },
    {
        videoId: "muFyksHgIa8",
        genre: "Drama",
        title: "Agonia de Amor (1947)",
        thumbnail: "https://img.youtube.com/vi/muFyksHgIa8/hqdefault.jpg"
    },
    {
        videoId: "TXxujKA7u64",
        genre: "Drama",
        title: "Rebecca, a Mulher Inesquecível (1940)",
        thumbnail: "https://img.youtube.com/vi/TXxujKA7u64/hqdefault.jpg"
    },
    {
        videoId: "IRmNWfMH2_A",
        genre: "Aventura",
        title: "O Último dos Moicanos (1936)",
        thumbnail: "https://img.youtube.com/vi/IRmNWfMH2_A/hqdefault.jpg"
    },
    {
        videoId: "sDJmCChYNjo",
        genre: "Drama",
        title: "Era Uma Vez em Tóquio (1953)",
        thumbnail: "https://img.youtube.com/vi/sDJmCChYNjo/hqdefault.jpg"
    },
    {
        videoId: "8xhPtuQqywA",
        genre: "Drama",
        title: "Pai e Filha (Banshun, 1949)",
        thumbnail: "https://img.youtube.com/vi/8xhPtuQqywA/hqdefault.jpg"
    },
    {
        videoId: "TiAQo8FnxOk",
        genre: "Épico",
        title: "Lawrence da Arábia (1962)",
        thumbnail: "https://img.youtube.com/vi/TiAQo8FnxOk/hqdefault.jpg"
    },
    {
        videoId: "XQFqhBtWgYY",
        genre: "Suspense",
        title: "O Terceiro Tiro (1955)",
        thumbnail: "https://img.youtube.com/vi/XQFqhBtWgYY/hqdefault.jpg"
    },
    {
        videoId: "iwxytHnXlIc",
        genre: "Suspense",
        title: "O Homem que Sabia Demais (1934)",
        thumbnail: "https://img.youtube.com/vi/iwxytHnXlIc/hqdefault.jpg"
    },
    {
        videoId: "atJlcHFCT00",
        genre: "Terror",
        title: "Despertar dos Mortos (1978)",
        thumbnail: "https://img.youtube.com/vi/atJlcHFCT00/hqdefault.jpg"
    },
    {
        videoId: "ag15Ehv5Qs0",
        genre: "Terror",
        title: "A Maldição da Múmia (1964)",
        thumbnail: "https://img.youtube.com/vi/ag15Ehv5Qs0/hqdefault.jpg"
    },
    {
        videoId: "VrsSufjlPM0",
        genre: "Drama",
        title: "Relâmpago (Inazuma, 1952)",
        thumbnail: "https://img.youtube.com/vi/VrsSufjlPM0/hqdefault.jpg"
    },
    {
        videoId: "csgWENaqy5Y",
        genre: "Drama",
        title: "Medo e Desejo (1953)",
        thumbnail: "https://img.youtube.com/vi/csgWENaqy5Y/hqdefault.jpg"
    },
    {
        videoId: "SaQLcriLMh4",
        genre: "Drama",
        title: "Crisântemos Tardios (1939)",
        thumbnail: "https://img.youtube.com/vi/SaQLcriLMh4/hqdefault.jpg"
    },
    {
        videoId: "TOjv5EEKGU0",
        genre: "Drama",
        title: "O Anjo Embriagado (1948)",
        thumbnail: "https://img.youtube.com/vi/TOjv5EEKGU0/hqdefault.jpg"
    },
    {
        videoId: "p6cS3B3upZc",
        genre: "Animação",
        title: "O Halloween de Pooh e o Efalante",
        thumbnail: "https://img.youtube.com/vi/p6cS3B3upZc/hqdefault.jpg"
    },
    {
        videoId: "TwaNQlc6Tm0",
        genre: "Animação",
        title: "TRANSFORMERS: O FILME (1986)",
        thumbnail: "https://img.youtube.com/vi/TwaNQlc6Tm0/hqdefault.jpg"
    },
    {
        videoId: "bKpTOAKL5PA",
        genre: "Terror",
        title: "O Morcego Diabólico (1940)",
        thumbnail: "https://img.youtube.com/vi/bKpTOAKL5PA/hqdefault.jpg"
    },
    {
        videoId: "QW_BqVae1Co",
        genre: "Comédia Romântica",
        title: "It (1927)",
        thumbnail: "https://img.youtube.com/vi/QW_BqVae1Co/hqdefault.jpg"
    },
    {
        videoId: "measf7YpqO0",
        genre: "Drama",
        title: "O Homem que Ri (1928)",
        thumbnail: "https://img.youtube.com/vi/measf7YpqO0/hqdefault.jpg"
    },
    {
        videoId: "-ePXfXV0Yus",
        genre: "Terror",
        title: "A Queda da Casa de Usher (1928)",
        thumbnail: "https://img.youtube.com/vi/-ePXfXV0Yus/hqdefault.jpg"
    },
    {
        videoId: "5JNDbPfO-Uk",
        genre: "Comédia",
        title: "As Três Idades (1923)",
        thumbnail: "https://img.youtube.com/vi/5JNDbPfO-Uk/hqdefault.jpg"
    },
    {
        videoId: "Bm7T8e07JxQ",
        genre: "Drama",
        title: "Recordações (1947)",
        thumbnail: "https://img.youtube.com/vi/Bm7T8e07JxQ/hqdefault.jpg"
    }
];

// Função para carregar recomendações
function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    recommendationsContainer.innerHTML = ''; // Limpa as recomendações anteriores

    // Filtrar alguns vídeos para recomendar (excluindo o vídeo atual)
    const currentVideoId = getCurrentVideoId();

    // Filtrar o vídeo atual e embaralhar os demais
    const recommendations = videos
        .filter(video => video.videoId !== currentVideoId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4); // Seleciona 4 vídeos

    recommendations.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');
        videoItem.setAttribute('data-video-id', video.videoId);
        videoItem.setAttribute('data-genre', video.genre);
        videoItem.setAttribute('data-title', video.title);

        // Verificar se o vídeo está salvo
        let isSaved = savedVideos.includes(video.videoId);

        videoItem.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="video-title">${video.title}</div>
            <button class="save-btn ${isSaved ? 'remove' : ''}">${isSaved ? 'Remover' : 'Salvar'}</button>
        `;

        // Evento de clique para abrir o vídeo
        videoItem.addEventListener('click', function(event) {
            if (event.target.classList.contains('save-btn')) return;
            window.location.href = `player.html?videoId=${video.videoId}`;
        });

        // Evento para salvar ou remover o vídeo
        const saveBtn = videoItem.querySelector('.save-btn');
        saveBtn.addEventListener('click', async function(event) {
            event.stopPropagation();
            if (isSaved) {
                await removeVideo(currentUser.uid, video.videoId);
                savedVideos = savedVideos.filter(id => id !== video.videoId);
                saveBtn.textContent = 'Salvar';
                saveBtn.classList.remove('remove');
                isSaved = false;
            } else {
                await saveVideo(currentUser.uid, video.videoId);
                savedVideos.push(video.videoId);
                saveBtn.textContent = 'Remover';
                saveBtn.classList.add('remove');
                isSaved = true;
            }
        });

        recommendationsContainer.appendChild(videoItem);
    });
}
