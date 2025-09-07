var API_BASE_URL = 'http://localhost:5002/api';

// Estado global
var pedalboards = [];
var pedals = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadPedalboards();
    loadPedals();
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
function loadPedalboards() {
    showLoading(true);
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + '/pedalboards', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                pedalboards = JSON.parse(xhr.responseText);
                renderPedalboards();
            } else {
                alert('Erro ao carregar pedalboards');
            }
            showLoading(false);
        }
    };
    xhr.send();
}

function renderPedalboards() {
    var container = document.getElementById('pedalboards-list');
    
    if (pedalboards.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Nenhum pedalboard encontrado</h3><p>Crie seu primeiro pedalboard!</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < pedalboards.length; i++) {
        var pedalboard = pedalboards[i];
        html += '<div class="card">';
        html += '<h3>' + pedalboard.name + '</h3>';
        html += '<p><strong>Descrição:</strong> ' + (pedalboard.description || 'Sem descrição') + '</p>';
        html += '<p><strong>Usuário ID:</strong> ' + pedalboard.user_id + '</p>';
        html += '<p><strong>Pedais:</strong> ' + (pedalboard.pedals ? pedalboard.pedals.length : 0) + '</p>';
        html += '<p><strong>Criado em:</strong> ' + new Date(pedalboard.created_at).toLocaleDateString('pt-BR') + '</p>';
        html += '<div class="card-actions">';
        html += '<button class="btn btn-primary" onclick="editPedalboard(' + pedalboard.id + ')">Editar</button>';
        html += '<button class="btn btn-danger" onclick="deletePedalboard(' + pedalboard.id + ')">Deletar</button>';
        html += '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
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

function handleCreatePedalboard(e) {
    e.preventDefault();
    
    var formData = {
        name: document.getElementById('pedalboard-name').value,
        description: document.getElementById('pedalboard-description').value,
        user_id: parseInt(document.getElementById('pedalboard-user-id').value)
    };
    
    var editId = document.getElementById('pedalboard-form').getAttribute('data-edit-id');
    var isEdit = editId !== null;
    var url = isEdit ? API_BASE_URL + '/pedalboards/' + editId : API_BASE_URL + '/pedalboards';
    var method = isEdit ? 'PUT' : 'POST';
    
    showLoading(true);
    
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                alert(isEdit ? 'Pedalboard atualizado com sucesso!' : 'Pedalboard criado com sucesso!');
                hideCreatePedalboardForm();
                loadPedalboards();
                loadPedals();
            } else {
                alert(isEdit ? 'Erro ao atualizar pedalboard' : 'Erro ao criar pedalboard');
            }
            showLoading(false);
        }
    };
    xhr.send(JSON.stringify(formData));
}

function deletePedalboard(id) {
    if (!confirm('Tem certeza que deseja deletar este pedalboard?')) return;
    
    showLoading(true);
    
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', API_BASE_URL + '/pedalboards/' + id, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert('Pedalboard deletado!');
                loadPedalboards();
                loadPedals();
            } else {
                alert('Erro ao deletar');
            }
            showLoading(false);
        }
    };
    xhr.send();
}

// Funções de Pedal
function loadPedals() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + '/pedals', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                pedals = JSON.parse(xhr.responseText);
                renderPedals();
                updatePedalboardDropdown();
            } else {
                alert('Erro ao carregar pedais');
            }
        }
    };
    xhr.send();
}

function renderPedals() {
    var container = document.getElementById('pedals-list');
    
    if (pedals.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Nenhum pedal encontrado</h3><p>Adicione seu primeiro pedal!</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < pedals.length; i++) {
        var pedal = pedals[i];
        html += '<div class="card">';
        html += '<h3>' + pedal.name + '</h3>';
        html += '<p><strong>Marca:</strong> ' + pedal.brand + '</p>';
        html += '<p><strong>Categoria:</strong> ' + pedal.category + '</p>';
        html += '<p><strong>Descrição:</strong> ' + (pedal.description || 'Sem descrição') + '</p>';
        html += '<p><strong>Plataforma ID:</strong> ' + pedal.pedalboard_id + '</p>';
        html += '<p><strong>Criado em:</strong> ' + new Date(pedal.created_at).toLocaleDateString('pt-BR') + '</p>';
        html += '<div class="card-actions">';
        html += '<button class="btn btn-primary" onclick="editPedal(' + pedal.id + ')">Editar</button>';
        html += '<button class="btn btn-danger" onclick="deletePedal(' + pedal.id + ')">Deletar</button>';
        html += '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

function updatePedalboardDropdown() {
    var dropdown = document.getElementById('pedal-pedalboard-id');
    dropdown.innerHTML = '<option value="">Selecione uma plataforma...</option>';
    
    for (var i = 0; i < pedalboards.length; i++) {
        var pedalboard = pedalboards[i];
        dropdown.innerHTML += '<option value="' + pedalboard.id + '">' + pedalboard.name + '</option>';
    }
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

function handleCreatePedal(e) {
    e.preventDefault();
    
    var formData = {
        name: document.getElementById('pedal-name').value,
        brand: document.getElementById('pedal-brand').value,
        category: document.getElementById('pedal-category').value,
        description: document.getElementById('pedal-description').value,
        pedalboard_id: parseInt(document.getElementById('pedal-pedalboard-id').value)
    };
    
    var editId = document.getElementById('pedal-form').getAttribute('data-edit-id');
    var isEdit = editId !== null;
    var url = isEdit ? API_BASE_URL + '/pedals/' + editId : API_BASE_URL + '/pedals';
    var method = isEdit ? 'PUT' : 'POST';
    
    showLoading(true);
    
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                alert(isEdit ? 'Pedal atualizado com sucesso!' : 'Pedal criado com sucesso!');
                hideCreatePedalForm();
                loadPedals();
            } else {
                alert(isEdit ? 'Erro ao atualizar pedal' : 'Erro ao criar pedal');
            }
            showLoading(false);
        }
    };
    xhr.send(JSON.stringify(formData));
}

function deletePedal(id) {
    if (!confirm('Tem certeza que deseja deletar este pedal?')) return;
    
    showLoading(true);
    
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', API_BASE_URL + '/pedals/' + id, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert('Pedal deletado!');
                loadPedals();
            } else {
                alert('Erro ao deletar pedal');
            }
            showLoading(false);
        }
    };
    xhr.send();
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