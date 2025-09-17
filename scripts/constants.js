export const API_BASE_URL = 'http://localhost:5002/api';

export const MESSAGES = {
    SUCCESS: {
        PEDALBOARD_CREATED: {
            title: 'Sucesso!',
            text: 'Pedalboard criado com sucesso!',
            icon: 'success'
        },
        PEDALBOARD_UPDATED: {
            title: 'Atualizado!',
            text: 'Pedalboard atualizado com sucesso!',
            icon: 'success'
        },
        PEDALBOARD_DELETED: {
            title: 'Deletado!',
            text: 'Pedalboard removido com sucesso!',
            icon: 'success'
        },
        PEDAL_CREATED: {
            title: 'Sucesso!',
            text: 'Pedal criado com sucesso!',
            icon: 'success'
        },
        PEDAL_UPDATED: {
            title: 'Atualizado!',
            text: 'Pedal atualizado com sucesso!',
            icon: 'success'
        },
        PEDAL_DELETED: {
            title: 'Deletado!',
            text: 'Pedal removido com sucesso!',
            icon: 'success'
        }
    },
    ERROR: {
        LOAD_PEDALBOARDS: {
            title: 'Erro!',
            text: 'Erro ao carregar pedalboards',
            icon: 'error'
        },
        LOAD_PEDALS: {
            title: 'Erro!',
            text: 'Erro ao carregar pedais',
            icon: 'error'
        },
        CREATE_PEDALBOARD: {
            title: 'Erro!',
            text: 'Erro ao criar pedalboard',
            icon: 'error'
        },
        UPDATE_PEDALBOARD: {
            title: 'Erro!',
            text: 'Erro ao atualizar pedalboard',
            icon: 'error'
        },
        DELETE_PEDALBOARD: {
            title: 'Erro!',
            text: 'Erro ao deletar pedalboard',
            icon: 'error'
        },
        CREATE_PEDAL: {
            title: 'Erro!',
            text: 'Erro ao criar pedal',
            icon: 'error'
        },
        UPDATE_PEDAL: {
            title: 'Erro!',
            text: 'Erro ao atualizar pedal',
            icon: 'error'
        },
        DELETE_PEDAL: {
            title: 'Erro!',
            text: 'Erro ao deletar pedal',
            icon: 'error'
        }
    },
    CONFIRM: {
        DELETE_PEDALBOARD: {
            title: 'Tem certeza?',
            text: 'Esta ação não pode ser desfeita!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        },
        DELETE_PEDAL: {
            title: 'Tem certeza?',
            text: 'Esta ação não pode ser desfeita!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }
    }
};

export const SELECTORS = {
    PEDALBOARDS_LIST: '#pedalboards-list',
    PEDALS_LIST: '#pedals-list',
    CREATE_PEDALBOARD_FORM: '#create-pedalboard-form',
    CREATE_PEDAL_FORM: '#create-pedal-form',
    PEDALBOARD_FORM: '#pedalboard-form',
    PEDAL_FORM: '#pedal-form',
    LOADING: '#loading'
};