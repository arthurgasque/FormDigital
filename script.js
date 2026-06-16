document.addEventListener("DOMContentLoaded", () => {
    // --- ESTADO DA APLICAÇÃO ---
    let colaboradorSelecionado = null;
    let itemSelecionado = null;
    let itensMovimentacao = [];
    let biometriaValidada = false;

    // --- MOCKS DE DADOS ---
    const colaboradoresMock = [
        { matricula: "1001", nome: "Carlos Silva", cargo: "Soldador", setor: "Produção" },
        { matricula: "1002", nome: "Marcos Souza", cargo: "Operador", setor: "Logística" },
        { matricula: "1003", nome: "Ana Costa", cargo: "Técnica de Segurança", setor: "HSE" },
        { matricula: "1004", nome: "Roberto Alves", cargo: "Almoxarife", setor: "Suprimentos" }
    ];

    const episMock = [
        "Capacete de Segurança Aba Frontal",
        "Botina de Couro com Biqueira",
        "Luva de Nitrílica Cano Médio",
        "Óculos de Proteção Incolor",
        "Protetor Auricular Plug",
        "Respirador Semifacial PFF2"
    ];

    // --- ELEMENTOS DO DOM ---
    const currentDateEl = document.getElementById("currentDate");
    const currentTimeEl = document.getElementById("currentTime");
    
    const dashTipoEl = document.getElementById("dashTipo");
    const dashItensEl = document.getElementById("dashItens");
    const dashValidacaoEl = document.getElementById("dashValidacao");
    
    const formForm = document.getElementById("movimentacaoEPIForm");
    const tipoBtns = document.querySelectorAll(".tipo-btn");
    const tipoMovimentacaoInput = document.getElementById("tipoMovimentacao");
    
    const matriculaInput = document.getElementById("matricula");
    const btnBuscarColaborador = document.getElementById("btnBuscarColaborador");
    const employeeNameEl = document.getElementById("employeeName");
    const employeeRoleEl = document.getElementById("employeeRole");
    const employeeSectorEl = document.getElementById("employeeSector");
    
    const nomeColaboradorInput = document.getElementById("nomeColaborador");
    const cargoColaboradorInput = document.getElementById("cargoColaborador");
    const setorColaboradorInput = document.getElementById("setorColaborador");
    
    const buscaItemInput = document.getElementById("buscaItem");
    const sugestoesItensContainer = document.getElementById("sugestoesItens");
    const quantidadeInput = document.getElementById("quantidade");
    const btnMenos = document.getElementById("btnMenos");
    const btnMais = document.getElementById("btnMais");
    const btnAdicionarItem = document.getElementById("btnAdicionarItem");
    const listaItensContainer = document.getElementById("listaItens");
    
    const btnBiometria = document.getElementById("btnBiometria");
    const statusBiometriaEl = document.getElementById("statusBiometria");
    const observacoesTextarea = document.getElementById("observacoes");
    const btnFinalizar = document.getElementById("btnFinalizar");

    // --- 1. RELÓGIO E DATA ---
    const atualizarRelogio = () => {
        const agora = new Date();
        currentDateEl.textContent = agora.toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        currentTimeEl.textContent = agora.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);

    // --- 2. ATUALIZAÇÃO DO DASHBOARD ---
    const atualizarDashboard = () => {
        const tipoAtivo = document.querySelector(".tipo-btn.active");
        dashTipoEl.textContent = tipoAtivo ? tipoAtivo.textContent.trim() : "Retirada";
        
        const totalItens = itensMovimentacao.reduce((acc, item) => acc + item.quantidade, 0);
        dashItensEl.textContent = totalItens;
        
        if (biometriaValidada) {
            dashValidacaoEl.textContent = "Validado";
            dashValidacaoEl.style.color = "var(--success)";
        } else {
            dashValidacaoEl.textContent = "Pendente";
            dashValidacaoEl.style.color = "var(--warning)";
        }
    };

    // --- 3. TIPO DE MOVIMENTAÇÃO ---
    tipoBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tipoBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const tipoValor = btn.getAttribute("data-tipo");
            tipoMovimentacaoInput.value = tipoValor;
            
            atualizarDashboard();
        });
    });

    // --- 4. BUSCA DE COLABORADOR ---
    const buscarColaborador = () => {
        const matricula = matriculaInput.value.trim();
        if (!matricula) {
            alert("Por favor, insira a matrícula para realizar a busca.");
            return;
        }

        const colaborador = colaboradoresMock.find(c => c.matricula === matricula);

        if (colaborador) {
            colaboradorSelecionado = colaborador;
            
            employeeNameEl.textContent = colaborador.nome;
            employeeRoleEl.textContent = colaborador.cargo;
            employeeSectorEl.textContent = colaborador.setor;
            
            nomeColaboradorInput.value = colaborador.nome;
            cargoColaboradorInput.value = colaborador.cargo;
            setorColaboradorInput.value = colaborador.setor;
        } else {
            colaboradorSelecionado = null;
            
            employeeNameEl.textContent = "Colaborador não encontrado";
            employeeRoleEl.textContent = "Verifique a matrícula digitada";
            employeeSectorEl.textContent = "Setor não informado";
            
            nomeColaboradorInput.value = "";
            cargoColaboradorInput.value = "";
            setorColaboradorInput.value = "";
        }
        atualizarDashboard();
    };

    btnBuscarColaborador.addEventListener("click", buscarColaborador);
    matriculaInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buscarColaborador();
        }
    });

    // --- 5. BUSCA DE ITENS (SUGESTÕES) ---
    buscaItemInput.addEventListener("input", () => {
        const query = buscaItemInput.value.trim().toLowerCase();
        sugestoesItensContainer.innerHTML = "";

        if (!query) {
            sugestoesItensContainer.style.display = "none";
            return;
        }

        const filtrados = episMock.filter(epi => epi.toLowerCase().includes(query));

        if (filtrados.length > 0) {
            filtrados.forEach(item => {
                const div = document.createElement("div");
                div.className = "sugestao-item";
                div.style.padding = "12px 16px";
                div.style.cursor = "pointer";
                div.style.borderBottom = "1px solid var(--border-color)";
                div.textContent = item;
                
                div.addEventListener("click", () => {
                    buscaItemInput.value = item;
                    itemSelecionado = item;
                    sugestoesItensContainer.innerHTML = "";
                    sugestoesItensContainer.style.display = "none";
                });

                sugestoesItensContainer.appendChild(div);
            });
            sugestoesItensContainer.style.display = "block";
        } else {
            sugestoesItensContainer.style.display = "none";
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target !== buscaItemInput && e.target !== sugestoesItensContainer) {
            sugestoesItensContainer.innerHTML = "";
            sugestoesItensContainer.style.display = "none";
        }
    });

    // --- 6. CONTROLE DE QUANTIDADE ---
    btnMenos.addEventListener("click", () => {
        let qtd = parseInt(quantidadeInput.value, 10) || 1;
        if (qtd > 1) {
            quantidadeInput.value = qtd - 1;
        }
    });

    btnMais.addEventListener("click", () => {
        let qtd = parseInt(quantidadeInput.value, 10) || 1;
        quantidadeInput.value = qtd + 1;
    });

    // --- 7 e 8. ADICIONAR E REMOVER ITENS ---
    const renderizarItens = () => {
        listaItensContainer.innerHTML = "";

        if (itensMovimentacao.length === 0) {
            listaItensContainer.innerHTML = `<div class="empty-state">Nenhum item adicionado</div>`;
            return;
        }

        itensMovimentacao.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "item-row";
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.justifyContent = "space-between";
            row.style.padding = "16px 20px";
            row.style.borderBottom = "1px solid var(--border-color)";
            row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";

            row.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <strong style="font-size: 15px; color: var(--text-primary);">${item.nome}</strong>
                    <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">Qtd: ${item.quantidade}</span>
                </div>
                <button type="button" class="btn-remove-item" data-index="${index}" style="background-color: var(--error-light); color: var(--error); padding: 8px 12px; font-size: 13px; border-radius: var(--radius-sm);">
                    <i class="fa-solid fa-trash-can"></i> Remover
                </button>
            `;

            row.querySelector(".btn-remove-item").addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
                itensMovimentacao.splice(idx, 1);
                renderizarItens();
                atualizarDashboard();
            });

            listaItensContainer.appendChild(row);
        });
    };

    btnAdicionarItem.addEventListener("click", () => {
        const nomeItem = buscaItemInput.value.trim();
        const qtdItem = parseInt(quantidadeInput.value, 10) || 1;

        if (!nomeItem) {
            alert("Selecione ou digite um EPI válido antes de adicionar.");
            return;
        }

        const itemExistente = itensMovimentacao.find(i => i.nome.toLowerCase() === nomeItem.toLowerCase());

        if (itemExistente) {
            itemExistente.quantidade += qtdItem;
        } else {
            itensMovimentacao.push({
                nome: nomeItem,
                quantidade: qtdItem
            });
        }

        buscaItemInput.value = "";
        quantidadeInput.value = "1";
        itemSelecionado = null;

        renderizarItens();
        atualizarDashboard();
    });

    // --- 9. SIMULAÇÃO DE BIOMETRIA ---
    btnBiometria.addEventListener("click", () => {
        btnBiometria.disabled = true;
        btnBiometria.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processando...`;
        
        statusBiometriaEl.textContent = "Analisando...";
        statusBiometriaEl.className = "status-badge pending";

        setTimeout(() => {
            biometriaValidada = true;
            
            statusBiometriaEl.textContent = "Validado";
            statusBiometriaEl.className = "status-badge success";
            
            btnBiometria.disabled = false;
            btnBiometria.innerHTML = "Validar Colaborador";
            
            atualizarDashboard();
        }, 2000);
    });

    // --- 10. FINALIZAÇÃO DO PROCESSO ---
    btnFinalizar.addEventListener("click", (e) => {
        e.preventDefault();

        if (!colaboradorSelecionado) {
            alert("Erro na Validação: É obrigatório buscar e selecionar um colaborador ativo.");
            return;
        }

        if (itensMovimentacao.length === 0) {
            alert("Erro na Validação: Adicione ao menos 1 item na listagem para movimentar.");
            return;
        }

        if (!biometriaValidada) {
            alert("Erro na Validação: A Validação Facial do colaborador é obrigatória.");
            return;
        }

        const payloadFinal = {
            matricula: colaboradorSelecionado.matricula,
            nome: colaboradorSelecionado.nome,
            cargo: colaboradorSelecionado.cargo,
            setor: colaboradorSelecionado.setor,
            tipoMovimentacao: tipoMovimentacaoInput.value,
            itens: [...itensMovimentacao],
            observacoes: observacoesTextarea.value.trim(),
            dataHora: new Date().toISOString()
        };

        console.log("=== MOVIMENTAÇÃO DE EPI FINALIZADA COM SUCESSO ===");
        console.log(JSON.stringify(payloadFinal, null, 2));

        alert(`Movimentação de EPI registrada com sucesso para ${colaboradorSelecionado.nome}!`);

        // Reset de Estado após sucesso
        colaboradorSelecionado = null;
        itemSelecionado = null;
        itensMovimentacao = [];
        biometriaValidada = false;

        formForm.reset();
        tipoBtns[0].click(); // Retorna ao padrão Retirada
        
        employeeNameEl.textContent = "Nenhum colaborador selecionado";
        employeeRoleEl.textContent = "Cargo não informado";
        employeeSectorEl.textContent = "Setor não informado";
        
        statusBiometriaEl.textContent = "Pendente";
        statusBiometriaEl.className = "status-badge pending";

        renderizarItens();
        atualizarDashboard();
    });

    // Tratamento genérico para evitar submits acidentais do formulário principal
    formForm.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    // Execução inicial de sincronia
    atualizarDashboard();
});