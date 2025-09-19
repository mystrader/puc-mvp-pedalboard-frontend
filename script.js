// Constante para URL base da API
const API_BASE_URL = 'http://127.0.0.1:5002/api';

// Variáveis globais para armazenar dados da API
var pedalboards = [];

var pedals = [];

// Variáveis removidas - IDs são gerenciados pelo backend

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Carrega dados iniciais com refresh automático
    await loadPedalboards();
    await loadPedals();
    
    // Refresh adicional para garantir sincronização
    setTimeout(async () => {
        await loadPedalboards();
        await loadPedals();
    }, 500);
    
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Formulário de pedalboard
    document.getElementById('pedalboard-form').addEventListener('submit', handleCreatePedalboard);
    
    // Formulário de pedal
    document.getElementById('pedal-form').addEventListener('submit', handleCreatePedal);
}

// Funções de Pedalboard
const loadPedalboards = async () => {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/pedalboards`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar pedalboards: ${response.status}`);
        }
        pedalboards = await response.json();
        renderPedalboards();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar pedalboards. Verifique se o servidor está rodando.');
    } finally {
        showLoading(false);
    }
}

const renderPedalboards = () => {
    const container = document.getElementById('pedalboards-list');
    
    if (pedalboards.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Nenhum pedalboard encontrado</h3><p>Crie seu primeiro pedalboard!</p></div>';
        return;
    }
    
    container.innerHTML = pedalboards.map(pedalboard => {
        // Filtrar pedais deste pedalboard
        const pedalboardPedals = pedals.filter(pedal => pedal.pedalboard_id === pedalboard.id);
        
        const pedalsGrid = pedalboardPedals.length > 0 
            ? `<div class="pedals-grid">
                ${pedalboardPedals.map(pedal => 
                    `<div class="pedal-item" title="${pedal.name} - ${pedal.brand} (${pedal.category})" onclick="editPedal(${pedal.id})">
                        <div class="pedal-icon">${getPedalIcon(pedal.category)}</div>
                    </div>`
                ).join('')}
               </div>`
            : '<p class="no-pedals">Nenhum pedal adicionado ainda</p>';
        
        return `
            <div class="card">
                <h3>${pedalboard.name}</h3>
                <p><strong>Descrição:</strong> ${pedalboard.description || 'Sem descrição'}</p>
                <p><strong>Criado em:</strong> ${new Date(pedalboard.created_at).toLocaleDateString('pt-BR')}</p>
                
                <div class="pedals-section">
                    <h4>✓ Pedais (${pedalboardPedals.length})</h4>
                    ${pedalsGrid}
                    <button class="btn btn-success btn-sm" onclick="showCreatePedalFormForBoard(${pedalboard.id})">+ Adicionar Pedal</button>
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="editPedalboard(${pedalboard.id})">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="deletePedalboard(${pedalboard.id})">🗑️ Deletar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Função para obter SVG do pedal baseado na categoria
function getPedalIcon(category) {
    var svgMap = {
        'distortion': 'assets/svg/pedais/pedal_distorcao.svg',
        'overdrive': 'assets/svg/pedais/pedal_overdrive.svg',
        'delay': 'assets/svg/pedais/pedal_delay.svg',
        'reverb': 'assets/svg/pedais/pedal_reverb.svg',
        'chorus': 'assets/svg/pedais/pedal_chorus.svg',
        'compressor': 'assets/svg/pedais/pedal_compressor.svg',
        'eq': 'assets/svg/pedais/pedal_equalizador.svg',
        'wah': 'assets/svg/pedais/pedal_wha.svg',
        'fuzz': 'assets/svg/pedais/pedal_distorcao.svg' // Usando distorção como fallback para fuzz
    };
    var svgPath = svgMap[category.toLowerCase()] || 'assets/svg/pedais/pedal_distorcao.svg';
    return '<img src="' + svgPath + '" alt="' + category + '" class="pedal-svg">';
}

// Função para abrir formulário de pedal com pedalboard pré-selecionado
function showCreatePedalFormForBoard(pedalboardId) {
    updatePedalboardDropdown();
    document.getElementById('pedal-pedalboard-id').value = pedalboardId;
    document.getElementById('create-pedal-form').style.display = 'flex';
}

function showCreatePedalboardForm() {
    document.getElementById('create-pedalboard-form').style.display = 'flex';
}

function hideCreatePedalboardForm() {
    document.getElementById('create-pedalboard-form').style.display = 'none';
    document.getElementById('pedalboard-form').reset();
    
    // Resetar estado de edição
    document.getElementById('pedalboard-form').removeAttribute('data-edit-id');
    document.querySelector('#create-pedalboard-form h3').textContent = 'Nova Plataforma de Pedais';
    document.querySelector('#create-pedalboard-form button[type="submit"]').textContent = 'Criar';
}

const handleCreatePedalboard = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('pedalboard-name').value;
    const description = document.getElementById('pedalboard-description').value;
    const user_id = parseInt(document.getElementById('pedalboard-user-id').value) || 1;
    
    const editId = document.getElementById('pedalboard-form').getAttribute('data-edit-id');
    const isEdit = editId !== null;
    
    showLoading(true);
    
    const requestData = {
        name,
        description,
        user_id
    };
    
    const url = isEdit ? `${API_BASE_URL}/pedalboards/${editId}` : `${API_BASE_URL}/pedalboards`;
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao ${isEdit ? 'atualizar' : 'criar'} pedalboard: ${response.status}`);
        }
        
        await response.json();
        hideCreatePedalboardForm();
        alert(`Pedalboard ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
        
        // Refresh automático
        await loadPedalboards();
        await loadPedals();
        updatePedalboardDropdown();
    } catch (error) {
        console.error('Erro:', error);
        alert(`Erro ao ${isEdit ? 'atualizar' : 'criar'} pedalboard. Verifique se o servidor está rodando.`);
    } finally {
        showLoading(false);
    }
}

const deletePedalboard = async (id) => {
    if (confirm('Tem certeza que deseja deletar este pedalboard? Todos os pedais associados também serão removidos.')) {
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/pedalboards/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao deletar pedalboard: ${response.status}`);
            }
            
            await response.json();
            alert('Pedalboard deletado com sucesso!');
            
            // Refresh automático
            await loadPedalboards();
            await loadPedals();
            updatePedalboardDropdown();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar pedalboard. Verifique se o servidor está rodando.');
        } finally {
            showLoading(false);
        }
    }
}

// Funções de Pedal
const loadPedals = async () => {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/pedals`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar pedais: ${response.status}`);
        }
        pedals = await response.json();
        renderPedals();
        updatePedalboardDropdown();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar pedais. Verifique se o servidor está rodando.');
    } finally {
        showLoading(false);
    }
}

const renderPedals = () => {
    const container = document.getElementById('pedals-list');
    
    if (pedals.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Nenhum pedal encontrado</h3><p>Adicione seu primeiro pedal!</p></div>';
        return;
    }
    
    container.innerHTML = `
        <table class="pedals-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Marca</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Plataforma</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${pedals.map(pedal => {
                    const pedalboard = pedalboards.find(pb => pb.id == pedal.pedalboard_id);
                    const pedalboardName = pedalboard ? pedalboard.name : 'N/A';
                    
                    return `
                        <tr>
                            <td>${pedal.name}</td>
                            <td>${pedal.brand}</td>
                            <td>${pedal.category}</td>
                            <td>${pedal.description || 'Sem descrição'}</td>
                            <td>${pedalboardName}</td>
                            <td>${new Date(pedal.created_at).toLocaleDateString('pt-BR')}</td>
                            <td class="table-actions">
                                <button class="btn btn-primary btn-sm" onclick="editPedal(${pedal.id})">✏️</button>
                                <button class="btn btn-danger btn-sm" onclick="deletePedal(${pedal.id})">🗑️</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

const updatePedalboardDropdown = () => {
    const select = document.getElementById('pedal-pedalboard-id');
    
    select.innerHTML = `
        <option value="">Selecione um pedalboard</option>
        ${pedalboards.map(pedalboard => 
            `<option value="${pedalboard.id}">${pedalboard.name}</option>`
        ).join('')}
    `;
}

function showCreatePedalForm() {
    updatePedalboardDropdown();
    document.getElementById('create-pedal-form').style.display = 'flex';
}

function hideCreatePedalForm() {
    document.getElementById('create-pedal-form').style.display = 'none';
    document.getElementById('pedal-form').reset();
    
    // Resetar estado de edição
    document.getElementById('pedal-form').removeAttribute('data-edit-id');
    document.querySelector('#create-pedal-form h3').textContent = 'Novo Pedal';
    document.querySelector('#create-pedal-form button[type="submit"]').textContent = 'Criar';
}

const handleCreatePedal = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('pedal-name').value;
    const brand = document.getElementById('pedal-brand').value;
    const category = document.getElementById('pedal-category').value;
    const description = document.getElementById('pedal-description').value;
    const pedalboard_id = parseInt(document.getElementById('pedal-pedalboard-id').value);
    
    const editId = document.getElementById('pedal-form').getAttribute('data-edit-id');
    const isEdit = editId !== null;
    
    showLoading(true);
    
    const requestData = {
        name,
        brand,
        category,
        description,
        pedalboard_id
    };
    
    const url = isEdit ? `${API_BASE_URL}/pedals/${editId}` : `${API_BASE_URL}/pedals`;
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao ${isEdit ? 'atualizar' : 'criar'} pedal: ${response.status}`);
        }
        
        await response.json();
        hideCreatePedalForm();
        alert(`Pedal ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
        
        // Refresh automático
        await loadPedals();
        await loadPedalboards();
    } catch (error) {
        console.error('Erro:', error);
        alert(`Erro ao ${isEdit ? 'atualizar' : 'criar'} pedal. Verifique se o servidor está rodando.`);
    } finally {
        showLoading(false);
    }
}

const deletePedal = async (id) => {
    if (confirm('Tem certeza que deseja deletar este pedal?')) {
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/pedals/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao deletar pedal: ${response.status}`);
            }
            
            await response.json();
            alert('Pedal deletado com sucesso!');
            
            // Refresh automático
            await loadPedals();
            await loadPedalboards();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar pedal. Verifique se o servidor está rodando.');
        } finally {
            showLoading(false);
        }
    }
}

// Função para trocar abas
function switchTab(tabName) {
    // Remover classe active de todos os botões de aba
    var tabButtons = document.querySelectorAll('.tab-button');
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Esconder todas as abas
    var tabContents = document.querySelectorAll('.tab-content');
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Ativar a aba selecionada
    if (tabName === 'pedalboards') {
        document.querySelector('.tab-button[onclick="switchTab(\'pedalboards\')"]').classList.add('active');
        document.getElementById('pedalboards-tab').classList.add('active');
    } else if (tabName === 'pedals') {
        document.querySelector('.tab-button[onclick="switchTab(\'pedals\')"]').classList.add('active');
        document.getElementById('pedals-tab').classList.add('active');
    }
    
    // Fechar modais abertos
    hideCreatePedalboardForm();
    hideCreatePedalForm();
}

// Funções utilitárias
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Funções de edição
function editPedalboard(id) {
    var pedalboard = pedalboards.find(function(p) { return p.id === id; });
    if (!pedalboard) return;
    
    // Preencher formulário com dados existentes
    document.getElementById('pedalboard-name').value = pedalboard.name;
    document.getElementById('pedalboard-description').value = pedalboard.description || '';
    document.getElementById('pedalboard-user-id').value = pedalboard.user_id;
    
    // Mostrar formulário
    document.getElementById('create-pedalboard-form').style.display = 'flex';
    
    // Alterar título e botão
    document.querySelector('#create-pedalboard-form h3').textContent = 'Editar Plataforma';
    document.querySelector('#create-pedalboard-form button[type="submit"]').textContent = 'Salvar';
    
    // Armazenar ID para edição
    document.getElementById('pedalboard-form').setAttribute('data-edit-id', id);
}

function editPedal(id) {
    var pedal = pedals.find(function(p) { return p.id === id; });
    if (!pedal) return;
    
    // Preencher formulário com dados existentes
    document.getElementById('pedal-name').value = pedal.name;
    document.getElementById('pedal-brand').value = pedal.brand;
    document.getElementById('pedal-category').value = pedal.category;
    document.getElementById('pedal-description').value = pedal.description || '';
    document.getElementById('pedal-pedalboard-id').value = pedal.pedalboard_id;
    
    // Atualizar dropdown
    updatePedalboardDropdown();
    
    // Mostrar formulário
    document.getElementById('create-pedal-form').style.display = 'flex';
    
    // Alterar título e botão
    document.querySelector('#create-pedal-form h3').textContent = 'Editar Pedal';
    document.querySelector('#create-pedal-form button[type="submit"]').textContent = 'Salvar';
    
    // Armazenar ID para edição
    document.getElementById('pedal-form').setAttribute('data-edit-id', id);
}