import { API_BASE_URL, MESSAGES, SELECTORS } from './constants.js';

// Função para mapear categoria para arquivo SVG
const getPedalSvg = (category) => {
    const svgMap = {
        'distortion': 'pedal_distorcao.svg',
        'overdrive': 'pedal_overdrive.svg',
        'delay': 'pedal_delay.svg',
        'reverb': 'pedal_reverb.svg',
        'chorus': 'pedal_chorus.svg',
        'wah': 'pedal_wha.svg',
        'compressor': 'pedal_compressor.svg',
        'eq': 'pedal_equalizador.svg'
    };
    return svgMap[category] || 'pedal_distorcao.svg'; // fallback
};

// Estado global
let pedalboards = [];
let pedals = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPedalboards();
    loadPedals();
});

// Event Listeners
const setupEventListeners = () => {
    document.querySelector(SELECTORS.PEDALBOARD_FORM).addEventListener('submit', handleCreatePedalboard);
    document.querySelector(SELECTORS.PEDAL_FORM).addEventListener('submit', handleCreatePedal);
};

// Função para trocar abas
const switchTab = (tabName) => {
    console.log('=== INÍCIO switchTab ===');
    console.log('Trocando para aba:', tabName);
    
    // Fechar qualquer modal aberto
    const pedalboardModal = document.querySelector(SELECTORS.CREATE_PEDALBOARD_FORM);
    const pedalModal = document.querySelector(SELECTORS.CREATE_PEDAL_FORM);
    
    console.log('Modal pedalboard encontrado:', pedalboardModal);
    console.log('Modal pedal encontrado:', pedalModal);
    
    if (pedalboardModal) {
        console.log('Fechando modal pedalboard');
        pedalboardModal.style.display = 'none';
    }
    if (pedalModal) {
        console.log('Fechando modal pedal');
        pedalModal.style.display = 'none';
    }
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => button.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    console.log('Aba trocada para:', tabName);
    console.log('=== FIM switchTab ===');
};

// Funções de Pedalboard - loadPedalboards movida para o final

const renderPedalboards = () => {
    console.log('Renderizando pedalboards:', pedalboards);
    const container = document.querySelector(SELECTORS.PEDALBOARDS_LIST);
    console.log('Container encontrado:', container);
    
    if (pedalboards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum pedalboard encontrado</h3>
                <p>Crie seu primeiro pedalboard!</p>
            </div>
        `;
        return;
    }
    
    const html = pedalboards.map(pedalboard => {
        const boardPedals = pedals.filter(pedal => pedal.pedalboard_id === pedalboard.id);
        
        return `
            <div class="card pedalboard-card">
                <div class="pedals-section">
             
                    
                    ${boardPedals.length > 0 ? `
                        <div class="pedals-grid">
                            ${boardPedals.map(pedal => `
                                <div class="pedal-svg-container" onclick="editPedal(${pedal.id})" title="${pedal.brand} - ${pedal.name}">
                                    <img src="assets/svg/pedais/${getPedalSvg(pedal.category)}" 
                                         alt="${pedal.name}" 
                                         class="pedal-svg" />
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-pedals">
                            <p><i class="fas fa-guitar"></i> Nenhum pedal adicionado ainda</p>
                        </div>
                    `}
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="editPedalboard(${pedalboard.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="deletePedalboard(${pedalboard.id})">
                        <i class="fas fa-trash"></i> Deletar
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
};

const showCreatePedalboardForm = () => {
    document.querySelector(SELECTORS.CREATE_PEDALBOARD_FORM).style.display = 'flex';
};

const hideCreatePedalboardForm = () => {
    const form = document.querySelector(SELECTORS.CREATE_PEDALBOARD_FORM);
    const pedalboardForm = document.querySelector(SELECTORS.PEDALBOARD_FORM);
    
    form.style.display = 'none';
    pedalboardForm.reset();
    pedalboardForm.removeAttribute('data-edit-id');
    
    document.querySelector('#create-pedalboard-form h3').textContent = 'Nova Plataforma de Pedais';
    document.querySelector('#create-pedalboard-form button[type="submit"]').textContent = 'Criar';
};

// Substituir todos os alert() por Swal.fire()

const handleCreatePedalboard = (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('pedalboard-name').value,
        description: document.getElementById('pedalboard-description').value,
        user_id: 1
    };
    
    const editId = document.querySelector(SELECTORS.PEDALBOARD_FORM).getAttribute('data-edit-id');
    const isEdit = editId !== null;
    const url = isEdit ? `${API_BASE_URL}/pedalboards/${editId}` : `${API_BASE_URL}/pedalboards`;
    const method = isEdit ? 'PUT' : 'POST';
    
    showLoading(true);
    
    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            const message = isEdit ? MESSAGES.SUCCESS.PEDALBOARD_UPDATED : MESSAGES.SUCCESS.PEDALBOARD_CREATED;
            Swal.fire(message);
            hideCreatePedalboardForm();
            loadPedalboards();
            loadPedals();
        } else {
            const message = isEdit ? MESSAGES.ERROR.UPDATE_PEDALBOARD : MESSAGES.ERROR.CREATE_PEDALBOARD;
            Swal.fire(message);
        }
        showLoading(false);
    })
    .catch(error => {
        const message = isEdit ? MESSAGES.ERROR.UPDATE_PEDALBOARD : MESSAGES.ERROR.CREATE_PEDALBOARD;
        Swal.fire(message);
        showLoading(false);
    });
};

const deletePedalboard = (id) => {
    Swal.fire(MESSAGES.CONFIRM.DELETE_PEDALBOARD).then((result) => {
        if (result.isConfirmed) {
            showLoading(true);
            
            fetch(`${API_BASE_URL}/pedalboards/${id}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(MESSAGES.SUCCESS.PEDALBOARD_DELETED);
                        loadPedalboards();
                        loadPedals();
                    } else {
                        Swal.fire(MESSAGES.ERROR.DELETE_PEDALBOARD);
                    }
                    showLoading(false);
                })
                .catch(error => {
                    Swal.fire(MESSAGES.ERROR.DELETE_PEDALBOARD);
                    showLoading(false);
                });
        }
    });
};

// Funções duplicadas removidas - mantidas apenas no final do arquivo

const handleCreatePedal = (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('pedal-name').value,
        brand: document.getElementById('pedal-brand').value,
        category: document.getElementById('pedal-category').value,
        description: document.getElementById('pedal-description').value,
        pedalboard_id: parseInt(document.getElementById('pedal-pedalboard-id').value)
    };
    
    const editId = document.querySelector(SELECTORS.PEDAL_FORM).getAttribute('data-edit-id');
    const isEdit = editId !== null;
    const url = isEdit ? `${API_BASE_URL}/pedals/${editId}` : `${API_BASE_URL}/pedals`;
    const method = isEdit ? 'PUT' : 'POST';
    
    showLoading(true);
    
    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            const message = isEdit ? MESSAGES.SUCCESS.PEDAL_UPDATED : MESSAGES.SUCCESS.PEDAL_CREATED;
            Swal.fire(message);
            hideCreatePedalForm();
            loadPedals();
            loadPedalboards();
        } else {
            const message = isEdit ? MESSAGES.ERROR.UPDATE_PEDAL : MESSAGES.ERROR.CREATE_PEDAL;
            Swal.fire(message);
        }
        showLoading(false);
    })
    .catch(error => {
        const message = isEdit ? MESSAGES.ERROR.UPDATE_PEDAL : MESSAGES.ERROR.CREATE_PEDAL;
        Swal.fire(message);
        showLoading(false);
    });
};

const deletePedal = (id) => {
    Swal.fire(MESSAGES.CONFIRM.DELETE_PEDAL).then((result) => {
        if (result.isConfirmed) {
            showLoading(true);
            
            fetch(`${API_BASE_URL}/pedals/${id}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(MESSAGES.SUCCESS.PEDAL_DELETED);
                        loadPedals();
                        loadPedalboards();
                    } else {
                        Swal.fire(MESSAGES.ERROR.DELETE_PEDAL);
                    }
                    showLoading(false);
                })
                .catch(error => {
                    Swal.fire(MESSAGES.ERROR.DELETE_PEDAL);
                    showLoading(false);
                });
        }
    });
};

const editPedalboard = (id) => {
    const pedalboard = pedalboards.find(p => p.id === id);
    if (!pedalboard) return;
    
    document.getElementById('pedalboard-name').value = pedalboard.name;
    document.getElementById('pedalboard-description').value = pedalboard.description || '';
    
    document.querySelector(SELECTORS.CREATE_PEDALBOARD_FORM).style.display = 'flex';
    document.querySelector('#create-pedalboard-form h3').textContent = 'Editar Plataforma';
    document.querySelector('#create-pedalboard-form button[type="submit"]').textContent = 'Salvar';
    document.querySelector(SELECTORS.PEDALBOARD_FORM).setAttribute('data-edit-id', id);
};

const editPedal = (id) => {
    const pedal = pedals.find(p => p.id === id);
    if (!pedal) return;
    
    document.getElementById('pedal-name').value = pedal.name;
    document.getElementById('pedal-brand').value = pedal.brand;
    document.getElementById('pedal-category').value = pedal.category;
    document.getElementById('pedal-description').value = pedal.description || '';
    document.getElementById('pedal-pedalboard-id').value = pedal.pedalboard_id;
    
    updatePedalboardDropdown();
    
    document.querySelector(SELECTORS.CREATE_PEDAL_FORM).style.display = 'flex';
    document.querySelector('#create-pedal-form h3').textContent = 'Editar Pedal';
    document.querySelector('#create-pedal-form button[type="submit"]').textContent = 'Salvar';
    document.querySelector('#delete-pedal-btn').style.display = 'inline-block';
    document.querySelector(SELECTORS.PEDAL_FORM).setAttribute('data-edit-id', id);
};

// Função para deletar pedal do formulário
const deletePedalFromForm = () => {
    const form = document.querySelector(SELECTORS.PEDAL_FORM);
    const pedalId = form.getAttribute('data-edit-id');
    
    if (pedalId) {
        deletePedal(pedalId);
        hideCreatePedalForm();
    }
};

// Funções utilitárias
const showLoading = (show) => {
    document.querySelector(SELECTORS.LOADING).style.display = show ? 'block' : 'none';
};

const showCreatePedalForm = (pedalboardId) => {
    console.log('=== INÍCIO showCreatePedalForm ===');
    console.log('pedalboardId recebido:', pedalboardId);
    
    try {
        // Primeiro, vamos tentar encontrar o formulário diretamente
        const form = document.getElementById('create-pedal-form');
        console.log('Formulário encontrado por ID:', form);
        
        if (!form) {
            console.error('ERRO: Formulário create-pedal-form não encontrado!');
            return;
        }
        
        // Mostrar o formulário PRIMEIRO
        console.log('Exibindo formulário...');
        form.style.display = 'flex';
        form.style.visibility = 'visible';
        form.style.opacity = '1';
        form.style.zIndex = '9999';
        
        console.log('Formulário exibido');
        
        // Depois atualizar dropdown (sem bloquear a exibição)
        setTimeout(() => {
            try {
                console.log('Atualizando dropdown...');
                const dropdown = document.getElementById('pedal-pedalboard-id');
                
                if (dropdown && pedalboards.length > 0) {
                    // Atualizar opções
                    const options = pedalboards.map(pedalboard => 
                        `<option value="${pedalboard.id}">${pedalboard.name}</option>`
                    ).join('');
                    
                    dropdown.innerHTML = `
                        <option value="">Selecione uma plataforma...</option>
                        ${options}
                    `;
                    
                    // Pré-selecionar pedalboard se fornecido
                    if (pedalboardId) {
                        dropdown.value = pedalboardId;
                        console.log('Pedalboard pré-selecionado:', pedalboardId);
                    }
                } else {
                    console.warn('Dropdown não encontrado ou pedalboards vazios');
                }
            } catch (dropdownError) {
                console.error('Erro ao atualizar dropdown:', dropdownError);
            }
        }, 100);
        
    } catch (error) {
        console.error('ERRO em showCreatePedalForm:', error);
    }
    
    console.log('=== FIM showCreatePedalForm ===');
};

const hideCreatePedalForm = () => {
    const form = document.querySelector(SELECTORS.CREATE_PEDAL_FORM);
    const pedalForm = document.querySelector(SELECTORS.PEDAL_FORM);
    
    form.style.display = 'none';
    pedalForm.reset();
    pedalForm.removeAttribute('data-edit-id');
    
    document.querySelector('#create-pedal-form h3').textContent = 'Novo Pedal';
    document.querySelector('#create-pedal-form button[type="submit"]').textContent = 'Criar';
    document.querySelector('#delete-pedal-btn').style.display = 'none';
};

const updatePedalboardDropdown = () => {
    console.log('updatePedalboardDropdown chamada');
    const dropdown = document.getElementById('pedal-pedalboard-id');
    console.log('Dropdown encontrado:', dropdown);
    console.log('Pedalboards disponíveis:', pedalboards);
    
    if (!dropdown) {
        console.error('Dropdown pedal-pedalboard-id não encontrado!');
        return;
    }
    
    const options = pedalboards.map(pedalboard => 
        `<option value="${pedalboard.id}">${pedalboard.name}</option>`
    ).join('');
    
    dropdown.innerHTML = `
        <option value="">Selecione uma plataforma...</option>
        ${options}
    `;
    console.log('Dropdown atualizado com', pedalboards.length, 'opções');
};

const renderPedals = () => {
    const container = document.querySelector(SELECTORS.PEDALS_LIST);
    
    if (pedals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum pedal encontrado</h3>
                <p>Adicione seu primeiro pedal!</p>
            </div>
        `;
        return;
    }
    
    const tableRows = pedals.map(pedal => `
        <tr>
            <td><strong>${pedal.name}</strong></td>
            <td>${pedal.brand}</td>
            <td><span class="category-badge">${pedal.category}</span></td>
            <td>${pedal.description || 'Sem descrição'}</td>
            <td>${pedal.pedalboard_id}</td>
            <td>${new Date(pedal.created_at).toLocaleDateString('pt-BR')}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-primary" onclick="editPedal(${pedal.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deletePedal(${pedal.id})">Deletar</button>
            </td>
        </tr>
    `).join('');
    
    container.innerHTML = `
        <div class="table-container">
            <table class="pedals-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Marca</th>
                        <th>Categoria</th>
                        <th>Descrição</th>
                        <th>Plataforma ID</th>
                        <th>Criado em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
};

// Funções que estavam duplicadas
const loadPedalboards = () => {
    console.log('Carregando pedalboards...');
    showLoading(true);
    
    fetch(`${API_BASE_URL}/pedalboards`)
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Pedalboards recebidos:', data);
            pedalboards = data;
            renderPedalboards();
            showLoading(false);
        })
        .catch(error => {
            console.error('Erro ao carregar pedalboards:', error);
            Swal.fire(MESSAGES.ERROR.LOAD_PEDALBOARDS);
            showLoading(false);
        });
};

const loadPedals = () => {
    fetch(`${API_BASE_URL}/pedals`)
        .then(response => response.json())
        .then(data => {
            pedals = data;
            renderPedals();
            // updatePedalboardDropdown removido - só deve ser chamado quando necessário
        })
        .catch(error => Swal.fire(MESSAGES.ERROR.LOAD_PEDALS));
};

// Tornar funções globais para onclick
window.switchTab = switchTab;
window.showCreatePedalboardForm = showCreatePedalboardForm;
window.hideCreatePedalboardForm = hideCreatePedalboardForm;
window.deletePedalboard = deletePedalboard;
window.showCreatePedalForm = showCreatePedalForm;
window.hideCreatePedalForm = hideCreatePedalForm;
window.deletePedal = deletePedal;
window.deletePedalFromForm = deletePedalFromForm;
window.editPedalboard = editPedalboard;
window.editPedal = editPedal;
window.loadPedalboards = loadPedalboards;
window.loadPedals = loadPedals;