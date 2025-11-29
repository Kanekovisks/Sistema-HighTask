import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

# Importa o DataManager do arquivo separado para persistência de dados
from datamanager import DataManager 

# ==================== APP PRINCIPAL ====================
class HighTaskApp(tk.Tk):
    def __init__(self):
        super().__init__()
        
        self.data_manager = DataManager() 
        
        self.title("HighTask - Sistema de Chamados")
        self.geometry("1200x780")
        self.configure(bg="#f8f9fa") # Fundo mais claro e suave
        self.minsize(1000, 600)

        self.current_user_data = None 

        self.style = ttk.Style(self)
        self._configure_styles()

        self.container = tk.Frame(self, bg="#f8f9fa")
        self.container.pack(fill="both", expand=True)

        self.frames = {}
        for F in (LoginScreen, DashboardScreen, TicketsScreen, NewTicketScreen, UsersScreen, EditTicketScreen):
            frame = F(self.container, self)
            self.frames[F.__name__] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show("LoginScreen")

    def _configure_styles(self):
        """Configura os estilos globais do ttk com design moderno."""
        # Tema Clam para melhor controle visual
        self.style.theme_use("clam") 
        
        # Cores
        PRIMARY_BLUE = "#0b61ff"
        BACKGROUND_GRAY = "#f8f9fa"
        LIGHT_BORDER = "#dee2e6"
        TEXT_DARK = "#212529"
        TEXT_GRAY = "#6c757d"
        
        # Configurações de Fundo
        self.style.configure("TFrame", background=BACKGROUND_GRAY) 
        
        # Títulos de Tela (Dashboard, Chamados)
        self.style.configure("Title.TLabel", font=("Segoe UI", 24, "bold"), background=BACKGROUND_GRAY, foreground=TEXT_DARK)
        self.style.configure("Welcome.TLabel", font=("Segoe UI", 11, "italic"), background=BACKGROUND_GRAY, foreground=TEXT_GRAY)

        # Sidebar Styling
        self.style.configure("Sidebar.TFrame", background=PRIMARY_BLUE)
        self.style.configure("SidebarTitle.TLabel", font=("Segoe UI", 24, "bold"), background=PRIMARY_BLUE, foreground="white")
        
        # Sidebar Buttons (usando tk.Button para maior controle de estilo sobre fundo colorido)
        # Note: tk.Button is used directly in Sidebar class for custom background/foreground control.

        # Cards do Dashboard
        self.style.configure("Card.TFrame", background="white", relief="flat", borderwidth=0)
        self.style.configure("CardTitle.TLabel", font=("Segoe UI", 12, "bold"), background="white", foreground="#495057")
        self.style.configure("CardNumber.TLabel", font=("Segoe UI", 32, "bold"), background="white", foreground=TEXT_DARK)
        
        # Botões de Ação Principal (Accent)
        self.style.configure("Accent.TButton", 
                             background=PRIMARY_BLUE, foreground="white", font=("Segoe UI", 10, "bold"), 
                             relief="flat", borderwidth=0, padding=[15, 8]) 
        self.style.map("Accent.TButton", 
                       background=[("active", "#094dd1"), ("pressed", "#094dd1")],
                       foreground=[("active", "white")])
        
        # Formulário Labels
        self.style.configure("FormLabel.TLabel", font=("Segoe UI", 11, "bold"), background="white", foreground=TEXT_DARK)
        
        # Treeview (Tabela)
        self.style.configure("Treeview", 
                             background="#ffffff", foreground=TEXT_DARK, rowheight=28,
                             fieldbackground="#ffffff", borderwidth=1, relief="solid")
        self.style.map("Treeview", background=[('selected', LIGHT_BORDER)]) 
        self.style.configure("Treeview.Heading", 
                             font=("Segoe UI", 10, "bold"), background="#e9ecef", foreground="#495057",
                             relief="flat", padding=[5, 5])


    def show(self, screen_name):
        """Exibe uma tela (Frame) sobre as demais."""
        frame = self.frames.get(screen_name)
        if frame:
            frame.tkraise()
            if hasattr(frame, 'on_show'):
                 frame.on_show()

    def logout(self):
        """Limpa o usuário atual e volta para a tela de Login."""
        self.current_user_data = None
        self.show("LoginScreen")


# ==================== LOGIN SCREEN ====================
class LoginScreen(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#f8f9fa")
        self.controller = controller

        # Card de login com fundo branco e borda sutil
        card = tk.Frame(self, bg="white", padx=50, pady=40, relief="flat", highlightbackground="#dee2e6", highlightthickness=1)
        card.place(relx=0.5, rely=0.5, anchor="center")

        ttk.Label(card, text="HighTask", font=("Segoe UI", 28, "bold"), background="white", foreground="#0b61ff").pack(pady=(0, 15))
        ttk.Label(card, text="Acesse sua conta", background="white", foreground="#6c757d", font=("Segoe UI", 11)).pack(pady=(0, 25))

        ttk.Label(card, text="E-mail:", background="white", foreground="#495057", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(10,0))
        self.email_var = tk.StringVar(value="adm@gmail.com") 
        ttk.Entry(card, textvariable=self.email_var, width=40, font=("Segoe UI", 11)).pack(pady=(5, 15))

        ttk.Label(card, text="Senha:", background="white", foreground="#495057", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(10,0))
        self.password_var = tk.StringVar(value="ADM123") 
        ttk.Entry(card, textvariable=self.password_var, show="*", width=40, font=("Segoe UI", 11)).pack(pady=(5, 25))

        ttk.Button(card, text="Entrar", style="Accent.TButton", command=self.check_login).pack(fill="x", ipady=5)

    def check_login(self):
        email = self.email_var.get().strip()
        password = self.password_var.get().strip()

        user = self.controller.data_manager.verify_login(email, password)

        if user:
            self.controller.current_user_data = user
            self.email_var.set("") 
            self.password_var.set("")
            self.controller.show("DashboardScreen")
        else:
            messagebox.showerror("Erro de Login", "E-mail ou senha incorretos.")


# ==================== SIDEBAR ====================
class Sidebar(tk.Frame):
    def __init__(self, parent, controller, width=240):
        super().__init__(parent, bg="#0b61ff", width=width)
        self.controller = controller
        self.pack_propagate(False) 

        ttk.Label(self, text="HighTask", style="SidebarTitle.TLabel").pack(pady=(30, 25))

        buttons = [
            ("🏠 Dashboard", "DashboardScreen"),
            ("🎫 Chamados", "TicketsScreen"),
            ("➕ Novo Chamado", "NewTicketScreen"),
            ("👥 Usuários", "UsersScreen"), 
        ]
        
        # Usando tk.Button para melhor controle de estilo no fundo azul
        button_style = {
            "bg": "#0b61ff", "fg": "white", "anchor": "w", "font": ("Segoe UI", 12),
            "bd": 0, "activebackground": "#094dd1", "activeforeground": "white", "cursor": "hand2",
            "padx": 15, "pady": 10
        }

        for text, screen in buttons:
            tk.Button(self, text=text, **button_style,
                      command=lambda s=screen: controller.show(s)).pack(fill="x", padx=15, pady=3)

        tk.Button(self, text="⏻ Sair", 
                  bg="#0b61ff", fg="white", font=("Segoe UI", 11),
                  bd=0, activebackground="#094dd1", activeforeground="white", cursor="hand2",
                  command=self.controller.logout).pack(side="bottom", pady=25, fill="x", padx=15, ipady=5)


# ==================== DASHBOARD ====================
class DashboardScreen(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#f8f9fa")
        self.controller = controller

        self.sidebar = Sidebar(self, controller)
        self.sidebar.pack(side="left", fill="y")

        main = tk.Frame(self, bg="#f8f9fa", padx=30, pady=25)
        main.pack(side="right", fill="both", expand=True)

        self.header = tk.Frame(main, bg="#f8f9fa")
        self.header.pack(fill="x", pady=(0, 20))

        ttk.Label(self.header, text="Dashboard", style="Title.TLabel").pack(side="left", anchor="w")
        
        self.user_label = ttk.Label(self.header, text="", style="Welcome.TLabel")
        self.user_label.pack(side="right", anchor="e")

        self.cards_frame = tk.Frame(main, bg="#f8f9fa")
        self.cards_frame.pack(fill="x", pady=(10, 20))
        
        self.card_labels = {}
        self._create_cards()

    def _create_cards(self):
        """Cria a estrutura visual dos cards aprimorados."""
        card_titles = [
            "Total de Chamados",
            "Em Aberto",
            "Em Andamento",
            "Resolvidos"
        ]
        
        card_icons = {
            "Total de Chamados": "📊",
            "Em Aberto": "⏳",
            "Em Andamento": "⚙️",
            "Resolvidos": "✅"
        }

        for i, title in enumerate(card_titles):
            # Card com borda para visual mais moderno
            card_wrapper = tk.Frame(self.cards_frame, bg="#e9ecef", highlightbackground="#dee2e6", highlightthickness=1, bd=0)
            card_wrapper.grid(row=0, column=i, padx=10, sticky="nsew", ipady=10)
            self.cards_frame.grid_columnconfigure(i, weight=1) 

            card = tk.Frame(card_wrapper, bg="white", padx=20, pady=15, relief="flat")
            card.pack(fill="both", expand=True)

            # Ícone e Título
            icon_title_frame = tk.Frame(card, bg="white")
            icon_title_frame.pack(anchor="w", pady=(0, 5))
            ttk.Label(icon_title_frame, text=card_icons.get(title, "📄"), font=("Segoe UI Symbol", 14), background="white", foreground="#6c757d").pack(side="left", padx=(0, 8))
            ttk.Label(icon_title_frame, text=title, style="CardTitle.TLabel").pack(side="left", anchor="w")
            
            number_label = ttk.Label(card, text="0", style="CardNumber.TLabel")
            number_label.pack(anchor="w", pady=(5, 0))
            self.card_labels[title] = number_label

    def _update_card_numbers(self):
        """Recalcula e atualiza os números dos cards usando dados persistentes."""
        tickets = self.controller.data_manager.get_all_tickets()
        
        total = len(tickets)
        open_count = sum(1 for t in tickets if t["status"] == "Em Aberto")
        andamento = sum(1 for t in tickets if t["status"] == "Em Andamento")
        resolved = sum(1 for t in tickets if t["status"] == "Resolvido")

        data = {
            "Total de Chamados": total,
            "Em Aberto": open_count,
            "Em Andamento": andamento,
            "Resolvidos": resolved
        }
        
        for title, count in data.items():
            if title in self.card_labels:
                self.card_labels[title].config(text=str(count))

    def update_user_label(self):
        """Atualiza a mensagem de boas-vindas."""
        user_data = self.controller.current_user_data
        user_role = user_data.get("role", "Usuário") if user_data else "Usuário"
        self.user_label.config(text=f"Bem-vindo, {user_role}")
            
    def on_show(self):
        """Método chamado ao exibir esta tela."""
        if not self.controller.current_user_data:
             self.controller.show("LoginScreen")
             return
        self.update_user_label()
        self._update_card_numbers()


# ==================== CHAMADOS (VISUALIZAÇÃO / GERENCIAMENTO) ====================
class TicketsScreen(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#f8f9fa")
        self.controller = controller

        self.sidebar = Sidebar(self, controller)
        self.sidebar.pack(side="left", fill="y")

        main = tk.Frame(self, bg="#f8f9fa", padx=30, pady=25)
        main.pack(side="right", fill="both", expand=True) 

        ttk.Label(main, text="Visualizar Chamados", style="Title.TLabel").pack(anchor="w", pady=(0, 20))
        
        self.action_frame = tk.Frame(main, bg="#f8f9fa")
        self.action_frame.pack(fill="x", pady=(0, 15))
        
        # Aplicando estilo Accent.TButton
        self.edit_button = ttk.Button(self.action_frame, text="✏️ Editar Chamado", 
                                      command=self._handle_edit, style="Accent.TButton")
        self.delete_button = ttk.Button(self.action_frame, text="🗑️ Excluir Chamado", 
                                        command=self._handle_delete, style="Accent.TButton")

        # Container para a tabela com borda sutil
        tree_frame = tk.Frame(main, bg="white", highlightbackground="#dee2e6", highlightthickness=1) 
        tree_frame.pack(fill="both", expand=True)

        scrollbar_y = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL)
        scrollbar_x = ttk.Scrollbar(tree_frame, orient=tk.HORIZONTAL)
        
        self.tree = ttk.Treeview(tree_frame, 
                                 columns=("Código", "Título", "Autor", "Categoria", "Prioridade", "Status", "Data"), 
                                 show="headings", 
                                 yscrollcommand=scrollbar_y.set,
                                 xscrollcommand=scrollbar_x.set,
                                 style="Treeview")
                                 
        scrollbar_y.config(command=self.tree.yview)
        scrollbar_x.config(command=self.tree.xview)
        
        self.tree.grid(row=0, column=0, sticky="nsew")
        scrollbar_y.grid(row=0, column=1, sticky="ns")
        scrollbar_x.grid(row=1, column=0, sticky="ew")
        
        tree_frame.grid_rowconfigure(0, weight=1)
        tree_frame.grid_columnconfigure(0, weight=1)

        self.tree.heading("Código", text="Código")
        self.tree.heading("Título", text="Título")
        self.tree.heading("Autor", text="Autor")
        self.tree.heading("Categoria", text="Categoria")
        self.tree.heading("Prioridade", text="Prioridade")
        self.tree.heading("Status", text="Status")
        self.tree.heading("Data", text="Data")
        
        self.tree.column("Código", width=80, anchor=tk.CENTER)
        self.tree.column("Título", width=300)
        self.tree.column("Autor", width=150)
        self.tree.column("Categoria", width=100, anchor=tk.CENTER)
        self.tree.column("Prioridade", width=100, anchor=tk.CENTER)
        self.tree.column("Status", width=100, anchor=tk.CENTER)
        self.tree.column("Data", width=150, anchor=tk.CENTER)
        
        self.tree.bind("<Double-1>", lambda event: self._handle_edit()) 


    def _load_tickets(self):
        self.tree.delete(*self.tree.get_children())
        tickets = self.controller.data_manager.get_all_tickets()
        for t in tickets:
            self.tree.insert("", tk.END, 
                             values=(t['code'], t['title'], t['author'], t['category'], t['priority'], t['status'], t['date']),
                             tags=(t['status'].replace(" ", "_"),), 
                             iid=t['code']) 

    def _update_permissions(self):
        user_data = self.controller.current_user_data
        role = user_data.get("role") if user_data else ""
        
        can_manage = role in ["Administrador", "Técnico"]
        
        if can_manage:
            self.edit_button.pack(side="left", padx=(0, 10))
            self.delete_button.pack(side="left")
        else:
            self.edit_button.pack_forget()
            self.delete_button.pack_forget()
            
    def _get_selected_ticket_code(self):
        selected_item = self.tree.focus()
        if not selected_item:
            messagebox.showwarning("Aviso", "Nenhum chamado selecionado.")
            return None
        return selected_item 

    def _handle_edit(self):
        code = self._get_selected_ticket_code()
        if code:
            tickets = self.controller.data_manager.get_all_tickets()
            ticket_data = next((t for t in tickets if t["code"] == code), None)
            
            if ticket_data:
                edit_screen = self.controller.frames["EditTicketScreen"]
                edit_screen.set_ticket_data(ticket_data)
                self.controller.show("EditTicketScreen")

    def _handle_delete(self):
        code = self._get_selected_ticket_code()
        if code:
            confirm = messagebox.askyesno(
                "Confirmação de Exclusão",
                f"Tem certeza que deseja excluir o chamado {code}?"
            )
            if confirm:
                if self.controller.data_manager.delete_ticket(code):
                    messagebox.showinfo("Sucesso", f"Chamado {code} excluído com sucesso.")
                    self._load_tickets() 
                else:
                    messagebox.showerror("Erro", "Falha ao excluir o chamado.")

    def on_show(self):
        if not self.controller.current_user_data:
             self.controller.show("LoginScreen")
             return
        
        self._update_permissions() 
        self._load_tickets()       


# ==================== NOVO CHAMADO ====================
class NewTicketScreen(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#f8f9fa")
        self.controller = controller

        self.sidebar = Sidebar(self, controller)
        self.sidebar.pack(side="left", fill="y")

        main = tk.Frame(self, bg="#f8f9fa", padx=30, pady=25)
        main.pack(side="right", fill="both", expand=True) 

        ttk.Label(main, text="Novo Chamado", style="Title.TLabel").pack(anchor="w", pady=(0, 20))

        # Card branco para o formulário
        form = tk.Frame(main, bg="white", highlightbackground="#dee2e6", highlightthickness=1, padx=25, pady=25)
        form.pack(fill="both", expand=True, padx=20, pady=20) 

        ttk.Label(form, text="Título:", style="FormLabel.TLabel").pack(anchor="w", padx=10, pady=(15, 5))
        self.title_var = tk.StringVar()
        ttk.Entry(form, textvariable=self.title_var, font=("Segoe UI", 11)).pack(pady=5, padx=10, fill="x")

        ttk.Label(form, text="Descrição:", style="FormLabel.TLabel").pack(anchor="w", padx=10, pady=(15, 5))
        
        text_frame = tk.Frame(form)
        text_frame.pack(fill="both", expand=True, padx=10, pady=5) 
        
        scrollbar = ttk.Scrollbar(text_frame)
        scrollbar.pack(side="right", fill="y")

        self.desc = tk.Text(text_frame, font=("Segoe UI", 11), bd=1, relief="solid", wrap="word", 
                            yscrollcommand=scrollbar.set, highlightbackground="#dee2e6", highlightthickness=1) 
        self.desc.pack(side="left", fill="both", expand=True) 
        scrollbar.config(command=self.desc.yview)

        ttk.Button(form, text="Criar Chamado", style="Accent.TButton", command=self.create_new_ticket).pack(pady=(25, 10), padx=10, anchor="w", ipady=5)

    def create_new_ticket(self):
        title = self.title_var.get().strip()
        desc = self.desc.get("1.0", "end").strip()
        
        if not title:
            messagebox.showwarning("Aviso", "Informe o título do chamado!")
            return

        user_data = self.controller.current_user_data
        if not user_data:
             messagebox.showerror("Erro", "Usuário não logado.")
             self.controller.show("LoginScreen")
             return

        author_name = user_data.get("author_name", user_data.get("role", "Desconhecido"))

        new_ticket = self.controller.data_manager.create_new_ticket(title, desc, author_name)
        
        messagebox.showinfo("Sucesso", f"Chamado '{title}' ({new_ticket['code']}) criado e salvo.")
        
        self.title_var.set("")
        self.desc.delete("1.0", "end")
        
        self.controller.show("TicketsScreen")
        
    def on_show(self):
        if not self.controller.current_user_data:
             self.controller.show("LoginScreen")


# ==================== TELA DE EDIÇÃO/VISUALIZAÇÃO DE CHAMADO ====================
class EditTicketScreen(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#f8f9fa")
        self.controller = controller
        self.ticket_code = None 

        self.sidebar = Sidebar(self, controller)
        self.sidebar.pack(side="left", fill="y")

        main = tk.Frame(self, bg="#f8f9fa", padx=30, pady=25)
        main.pack(side="right", fill="both", expand=True) 

        ttk.Label(main, text="Detalhes do Chamado", style="Title.TLabel").pack(anchor="w", pady=(0, 20))

        # Card branco para o formulário
        form = tk.Frame(main, bg="white", highlightbackground="#dee2e6", highlightthickness=1, padx=25, pady=25)
        form.pack(fill="both", expand=True, padx=20, pady=20) 

        # Título
        ttk.Label(form, text="Título:", style="FormLabel.TLabel").pack(anchor="w", padx=10, pady=(15, 5))
        self.title_var = tk.StringVar()
        self.title_entry = ttk.Entry(form, textvariable=self.title_var, font=("Segoe UI", 11))
        self.title_entry.pack(pady=5, padx=10, fill="x")

        # Status (Dropdown)
        ttk.Label(form, text="Status:", style="FormLabel.TLabel").pack(anchor="w", padx=10, pady=(15, 5))
        self.status_var = tk.StringVar()
        status_options = ["Em Aberto", "Em Andamento", "Resolvido", "Fechado"]
        self.status_dropdown = ttk.Combobox(form, textvariable=self.status_var, values=status_options, font=("Segoe UI", 11), state="readonly")
        self.status_dropdown.pack(pady=5, padx=10, fill="x")

        # Prioridade (Dropdown)
        ttk.Label(form, text="Prioridade:", style="FormLabel.TLabel").pack(anchor="w", padx=10, pady=(15, 5))
        self.priority_var = tk.StringVar()
        priority_options = ["Baixa", "Média", "Alta", "Urgente"]
        self.priority_dropdown = ttk.Combobox(form, textvariable=self.priority_var, values=priority_options, font=("Segoe UI", 11), state="readonly")
        self.priority_dropdown.pack(pady=5, padx=10, fill="x")

        # Descrição (Text field - Read Only)
        ttk.Label(form, text="Descrição Original:", style="FormLabel.TLabel").pack(anchor="w", padx=10, pady=(15, 5))
        text_frame = tk.Frame(form)
        text_frame.pack(fill="both", expand=True, padx=10, pady=5) 
        
        scrollbar = ttk.Scrollbar(text_frame)
        scrollbar.pack(side="right", fill="y")

        self.desc_text = tk.Text(text_frame, font=("Segoe UI", 11), bd=1, relief="solid", wrap="word", 
                            yscrollcommand=scrollbar.set, height=10, state=tk.DISABLED, 
                            highlightbackground="#dee2e6", highlightthickness=1)
        self.desc_text.pack(side="left", fill="both", expand=True) 
        scrollbar.config(command=self.desc_text.yview)

        # Botão Salvar
        self.save_button = ttk.Button(form, text="Salvar Alterações", style="Accent.TButton", command=self._save_changes)
        self.save_button.pack(pady=(25, 10), padx=10, anchor="w", ipady=5)

        ttk.Button(form, text="Voltar para Chamados", command=lambda: controller.show("TicketsScreen")).pack(padx=10, anchor="w")


    def _set_edit_state(self, state):
        """Define se os campos de edição estão ativados (ADM/TEC) ou desativados (Visualização Pura)."""
        new_state = tk.NORMAL if state else tk.DISABLED
        
        self.title_entry.config(state=new_state)
        # O estado "readonly" em Combobox ainda permite seleção, mas não digitação. 
        # O disabled esconde a seta e desativa totalmente.
        self.status_dropdown.config(state="readonly" if state else tk.DISABLED)
        self.priority_dropdown.config(state="readonly" if state else tk.DISABLED)
        
        if state:
            self.save_button.pack(pady=(25, 10), padx=10, anchor="w", ipady=5)
        else:
            self.save_button.pack_forget()

    def set_ticket_data(self, data):
        """Popula os campos com os dados do chamado selecionado."""
        self.ticket_code = data["code"]
        self.title_var.set(data["title"])
        self.status_var.set(data["status"])
        self.priority_var.set(data["priority"])
        
        self.desc_text.config(state=tk.NORMAL)
        self.desc_text.delete("1.0", tk.END)
        self.desc_text.insert("1.0", data["desc"])
        self.desc_text.config(state=tk.DISABLED)

    def _save_changes(self):
        """Salva as alterações do chamado usando o DataManager."""
        if not self.ticket_code:
            messagebox.showerror("Erro", "Nenhum chamado selecionado para edição.")
            return

        new_data = {
            "title": self.title_var.get().strip(),
            "status": self.status_var.get(),
            "priority": self.priority_var.get(),
        }
        
        if self.controller.data_manager.edit_ticket(self.ticket_code, new_data):
            messagebox.showinfo("Sucesso", f"Chamado {self.ticket_code} atualizado com sucesso!")
            self.controller.show("TicketsScreen")
        else:
            messagebox.showerror("Erro", "Falha ao salvar as alterações do chamado.")

    def on_show(self):
        """Garante que o usuário está logado e define as permissões de edição."""
        user_data = self.controller.current_user_data
        
        if not user_data:
             self.controller.show("LoginScreen")
             return

        role = user_data.get("role", "Usuário Padrão")
        
        # Apenas ADM e TEC podem EDITAR
        can_edit = role in ["Administrador", "Técnico"]
        self._set_edit_state(can_edit)


# ==================== USUÁRIOS ====================
class UsersScreen(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#f8f9fa")
        self.controller = controller
        
        self.sidebar = Sidebar(self, controller)
        self.sidebar.pack(side="left", fill="y")

        main = tk.Frame(self, bg="#f8f9fa", padx=30, pady=25)
        main.pack(side="right", fill="both", expand=True)

        ttk.Label(main, text="Usuários", style="Title.TLabel").pack(anchor="w", pady=(0, 20))
        
        self.info_label = ttk.Label(main, text="", background="#f8f9fa", font=("Segoe UI", 11, "bold"), foreground="red")
        self.info_label.pack(anchor="w", pady=(0, 10))
        
        ttk.Label(main, text="Área de gerenciamento de usuários. (Funcionalidade de listagem não implementada)", 
                  background="#f8f9fa", foreground="#666").pack(anchor="w", pady=(10, 0))

    def on_show(self):
        """Verifica se o usuário tem permissão de Administrador."""
        user_data = self.controller.current_user_data
        
        if not user_data:
             self.controller.show("LoginScreen")
             return

        if user_data.get("role") != "Administrador":
             self.info_label.config(text="ACESSO NEGADO: Apenas Administradores podem acessar esta tela.")
        else:
             self.info_label.config(text=f"Permissão concedida: {user_data.get('role')}")


# ==================== EXECUÇÃO ====================
if __name__ == "__main__":
    app = HighTaskApp()
    app.mainloop()