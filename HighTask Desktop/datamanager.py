import json
import os
import time
import hashlib
from datetime import datetime

class DataManager:
    """
    Gerencia a persistência dos dados (Usuários e Chamados) usando arquivos JSON.
    """
    USERS_FILE = "users.json"
    TICKETS_FILE = "tickets.json"

    def __init__(self):
        self._load_initial_data()

    def _load_initial_data(self):
        """Carrega dados dos arquivos ou cria arquivos com dados iniciais se não existirem."""
        
        # --- Usuários ---
        if not os.path.exists(self.USERS_FILE):
            # Senha salva como hash (segurança básica)
            initial_users = {
                "adm@gmail.com": {"password_hash": self._hash_password("ADM123"), "role": "Administrador", "author_name": "Administrador"},
                "tec@gmail.com": {"password_hash": self._hash_password("TEC123"), "role": "Técnico", "author_name": "Técnico"},
                "teste@gmail.com": {"password_hash": self._hash_password("teste123"), "role": "Usuário de Teste", "author_name": "Usuário Teste"},
            }
            self._save_data(initial_users, self.USERS_FILE)
        
        # --- Chamados ---
        if not os.path.exists(self.TICKETS_FILE):
            initial_tickets = [
                {"title": "Monitor flickando", "code": "#fae6e2a3", "desc": "Problemas de flick na tela após uso prolongado",
                 "category": "Hardware", "status": "Em Aberto", "priority": "Baixa", "author": "Administrador",
                 "date": "23/10/2025 01:26"},
                {"title": "Erro visual", "code": "#4530207b", "desc": "Erro de renderização em janela do sistema",
                 "category": "Software", "status": "Em Aberto", "priority": "Baixa", "author": "Usuário Teste",
                 "date": "09/10/2025 19:58"},
                {"title": "Erro de vídeo", "code": "#9d05ef65", "desc": "Entrada de vídeo com ruído ao alternar telas",
                 "category": "Hardware", "status": "Em Andamento", "priority": "Média", "author": "Técnico",
                 "date": "08/10/2025 11:12"},
            ]
            self._save_data(initial_tickets, self.TICKETS_FILE)

    def _load_data(self, filename):
        """Lê os dados de um arquivo JSON."""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return None
        except json.JSONDecodeError:
            return {} if filename == self.USERS_FILE else []

    def _save_data(self, data, filename):
        """Salva os dados em um arquivo JSON."""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    def _hash_password(self, password):
        """Cria um hash SHA-256 da senha."""
        return hashlib.sha256(password.encode('utf-8')).hexdigest()

    # --- Funções de Usuário (Interface Pública) ---
    def get_user_data(self, email):
        """Retorna os dados de um usuário pelo email."""
        users = self._load_data(self.USERS_FILE)
        return users.get(email)

    def verify_login(self, email, password):
        """Verifica se as credenciais de login são válidas."""
        user = self.get_user_data(email)
        if user and user.get("password_hash") == self._hash_password(password):
            return user
        return None

    # --- Funções de Chamado (Interface Pública) ---
    def get_all_tickets(self):
        """Retorna a lista completa de chamados."""
        return self._load_data(self.TICKETS_FILE) or []

    def create_new_ticket(self, title, desc, author_name):
        """Adiciona um novo chamado e salva a lista atualizada."""
        tickets = self.get_all_tickets()
        
        code = f"#{int(time.time() * 1000):x}" 
        
        new_ticket = {
            "title": title, 
            "code": code,
            "desc": desc, 
            "category": "Solicitação", 
            "status": "Em Aberto",     
            "priority": "Média",       
            "author": author_name, 
            "date": datetime.now().strftime("%d/%m/%Y %H:%M")
        }
        
        tickets.append(new_ticket)
        self._save_data(tickets, self.TICKETS_FILE)
        return new_ticket
        
    def edit_ticket(self, code, new_data):
        """Edita um chamado existente baseado no código."""
        tickets = self.get_all_tickets()
        
        found = False
        for i, t in enumerate(tickets):
            if t["code"] == code:
                for key, value in new_data.items():
                    if key in t:
                        t[key] = value
                found = True
                break
                
        if found:
            self._save_data(tickets, self.TICKETS_FILE)
            return True
        return False

    def delete_ticket(self, code):
        """Exclui um chamado existente baseado no código."""
        tickets = self.get_all_tickets()
        
        new_tickets = [t for t in tickets if t["code"] != code]
        
        if len(new_tickets) < len(tickets):
            self._save_data(new_tickets, self.TICKETS_FILE)
            return True
        return False