let currentTemplate = 'basic';
let skills = [];
let currentPaymentId = null;

// CONFIGURAÇÃO DO PIX
const PIX_CONFIG = {
    key: "38064658861",
    name: "MURYLOSENNE",
    city: "RIO CLARO",
    amount: "2.00"
};

document.addEventListener('DOMContentLoaded', () => {
    initSync();
    initZoom();
    initSkills();
    initTemplateSelector();
    initPhoto();
    initProtection();
});

function initProtection() {
    const previewCanvas = document.querySelector('.preview-canvas');
    if (previewCanvas) {
        previewCanvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) || e.key === 'F12') {
            e.preventDefault();
        }
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
            alert('Prints são bloqueados para proteger o conteúdo.');
        }
    });
}

function initPhoto() {
    const photoInput = document.getElementById('in-photo');
    const cvPhoto = document.getElementById('cv-photo');

    photoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                cvPhoto.src = event.target.result;
                cvPhoto.parentElement.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

function initTemplateSelector() {
    const radios = document.querySelectorAll('input[name="template"]');
    const hiddenInput = document.getElementById('current-template');
    const previewPaper = document.getElementById('cv-preview');
    const cards = document.querySelectorAll('.template-card');

    function updateTemplateUI(value) {
        hiddenInput.value = value;
        currentTemplate = value;
        previewPaper.className = `cv-paper ${value}`;
        cards.forEach(card => {
            card.style.borderColor = '#e2e8f0';
            card.style.backgroundColor = 'transparent';
        });
        const selectedRadio = document.querySelector(`input[name="template"][value="${value}"]`);
        if (selectedRadio) {
            const selectedCard = selectedRadio.nextElementSibling;
            selectedCard.style.borderColor = '#2563eb';
            selectedCard.style.backgroundColor = '#eff6ff';
        }
    }

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => updateTemplateUI(e.target.value));
    });
}

function initSync() {
    const syncInputs = document.querySelectorAll('[data-sync]');
    syncInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const targetId = e.target.getAttribute('data-sync');
            const target = document.getElementById(targetId);
            if (target) target.innerText = e.target.value;
            const sideTarget = document.getElementById(`${targetId}-side`);
            if (sideTarget) sideTarget.innerText = e.target.value;
        });
    });
}

function syncDynamic(input, targetId) {
    const target = document.getElementById(targetId);
    if (target) target.innerText = input.value;
}

function initZoom() {
    const canvas = document.getElementById('cv-preview');
    const levelDisplay = document.getElementById('zoom-level');
    let scale = 0.8;

    const autoScale = () => {
        if (window.innerWidth < 480) {
            scale = (window.innerWidth - 30) / 800;
        } else if (window.innerWidth < 1024) {
            scale = (window.innerWidth - 100) / 800;
        } else {
            scale = 0.8;
        }
        if (scale > 1) scale = 1;
        if (scale < 0.2) scale = 0.2;
        updateScale();
    };

    if (document.getElementById('zoom-in')) {
        document.getElementById('zoom-in').addEventListener('click', () => {
            scale += 0.1;
            updateScale();
        });
    }

    if (document.getElementById('zoom-out')) {
        document.getElementById('zoom-out').addEventListener('click', () => {
            scale -= 0.1;
            updateScale();
        });
    }

    function updateScale() {
        canvas.style.setProperty('transform', `scale(${scale})`, 'important');
        if (levelDisplay) levelDisplay.innerText = `${Math.round(scale * 100)}%`;
    }

    autoScale();
    window.addEventListener('resize', autoScale);
}

// HABILIDADES
function initSkills() {
    const input = document.getElementById('skill-input');
    if (!input) return;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = input.value.trim();
            if (val && !skills.includes(val)) {
                addSkill(val);
                input.value = '';
            }
        }
    });
}

function addSkill(name) {
    skills.push(name);
    const tagsContainer = document.getElementById('skills-tags');
    const previewMain = document.getElementById('preview-skills-list-main');
    const previewSide = document.getElementById('preview-skills-list-side');
    const id = `skill-${Date.now()}`;

    const tag = document.createElement('div');
    tag.className = 'skill-tag-input';
    tag.innerHTML = `${name} <span onclick="removeSkill('${name}', '${id}')">×</span>`;
    tagsContainer.appendChild(tag);

    const pTagMain = document.createElement('div');
    pTagMain.className = 'skill-tag';
    pTagMain.id = `preview-main-${id}`;
    pTagMain.innerText = name;
    if (previewMain) previewMain.appendChild(pTagMain);

    const pTagSide = document.createElement('div');
    pTagSide.className = 'skill-tag';
    pTagSide.id = `preview-side-${id}`;
    pTagSide.innerText = name;
    if (previewSide) previewSide.appendChild(pTagSide);
}

function removeSkill(name, id) {
    skills = skills.filter(s => s !== name);
    const tag = document.querySelector(`.skill-tag-input [onclick*="${id}"]`)?.parentElement;
    if (tag) tag.remove();
    document.getElementById(`preview-main-${id}`)?.remove();
    document.getElementById(`preview-side-${id}`)?.remove();
}

// EXPERIENCIA E EDUCAÇÃO
function addExperience() {
    const container = document.getElementById('exp-items');
    const id = Date.now();
    const html = `
        <div class="dynamic-item" id="exp-${id}">
            <button type="button" class="remove-btn" onclick="removeItem('exp-${id}', 'preview-exp-${id}')">×</button>
            <div class="input-group">
                <label>Empresa</label>
                <input type="text" placeholder="Empresa S/A" oninput="syncDynamic(this, 'preview-exp-comp-${id}')">
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Cargo</label>
                    <input type="text" placeholder="Desenvolvedor" oninput="syncDynamic(this, 'preview-exp-role-${id}')">
                </div>
                <div class="input-group">
                    <label>Período</label>
                    <input type="text" placeholder="2020 - Presente" oninput="syncDynamic(this, 'preview-exp-period-${id}')">
                </div>
            </div>
            <div class="input-group">
                <label>Descrição</label>
                <textarea placeholder="Descreva suas responsabilidades..." oninput="syncDynamic(this, 'preview-exp-desc-${id}')"></textarea>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    document.getElementById('preview-exp-list').insertAdjacentHTML('beforeend', `
        <div class="preview-item" id="preview-exp-${id}">
            <strong><span id="preview-exp-role-${id}">Cargo</span></strong>
            <span class="period" id="preview-exp-period-${id}">Período</span>
            <em><span id="preview-exp-comp-${id}">Empresa</span></em>
            <p id="preview-exp-desc-${id}"></p>
        </div>
    `);
}

function addEducation() {
    const container = document.getElementById('edu-items');
    const id = Date.now();
    const html = `
        <div class="dynamic-item" id="edu-${id}">
            <button type="button" class="remove-btn" onclick="removeItem('edu-${id}', 'preview-edu-${id}')">×</button>
            <div class="input-row">
                <div class="input-group">
                    <label>Instituição</label>
                    <input type="text" placeholder="Universidade X" oninput="syncDynamic(this, 'preview-edu-school-${id}')">
                </div>
                <div class="input-group">
                    <label>Curso/Grau</label>
                    <input type="text" placeholder="Engenharia" oninput="syncDynamic(this, 'preview-edu-degree-${id}')">
                </div>
            </div>
            <div class="input-group">
                <label>Ano</label>
                <input type="text" placeholder="2023" oninput="syncDynamic(this, 'preview-edu-year-${id}')">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    document.getElementById('preview-edu-list').insertAdjacentHTML('beforeend', `
        <div class="preview-item" id="preview-edu-${id}">
            <strong><span id="preview-edu-degree-${id}">Curso</span></strong>
            <span class="period" id="preview-edu-year-${id}">Ano</span>
            <em><span id="preview-edu-school-${id}">Instituição</span></em>
        </div>
    `);
}

function removeItem(formId, previewId) {
    document.getElementById(formId)?.remove();
    document.getElementById(previewId)?.remove();
}

// FUNÇÕES DE PAGAMENTO
async function downloadImage() { await openPaymentModal(); }

async function openPaymentModal() {
    const btn = document.querySelector('.btn-download.pdf');
    const originalBtn = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>...';

    try {
        const response = await fetch('/create_payment', { method: 'POST' });
        const payment = await response.json();
        if (payment.id) {
            currentPaymentId = payment.id;
            document.querySelector('#pix-qrcode img').src = `data:image/png;base64,${payment.point_of_interaction.transaction_data.qr_code_base64}`;
            document.getElementById('pix-code').value = payment.point_of_interaction.transaction_data.qr_code;
        }
    } catch (e) {}
    document.getElementById('payment-modal').classList.add('active');
    btn.innerHTML = originalBtn;
}

function closePaymentModal() { document.getElementById('payment-modal').classList.remove('active'); }

function copyPixCode() {
    const pixCode = document.getElementById('pix-code');
    pixCode.select();
    document.execCommand('copy');
    alert('PIX Copiado!');
}

async function verifyAndDownload() {
    const btn = document.querySelector('.btn-confirm');
    const originalBtn = btn.innerHTML;
    btn.innerHTML = 'Verificando...';
    if (currentPaymentId) {
        try {
            const response = await fetch(`/check_payment/${currentPaymentId}`);
            const data = await response.json();
            if (data.status === 'approved') {
                await executeDownload();
                closePaymentModal();
            } else { alert("Aguardando aprovação..."); }
        } catch (e) { alert("Erro de rede."); }
    } else {
        setTimeout(async () => { await executeDownload(); closePaymentModal(); }, 2000);
    }
    btn.innerHTML = originalBtn;
}

async function executeDownload() {
    const paper = document.getElementById('cv-preview');
    paper.classList.add('downloading');
    
    // Salva o estado atual
    const originalTransform = paper.style.transform;
    const originalWidth = paper.style.width;
    
    // Reseta para tamanho real para a captura
    paper.style.setProperty('transform', 'none', 'important');
    paper.style.width = '210mm'; // Garante largura A4
    
    try {
        // Pequena pausa para o navegador processar o reset de estilo
        await new Promise(r => setTimeout(r, 500));
        
        const canvas = await html2canvas(paper, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            windowWidth: 800, // Força largura de captura
            scrollY: -window.scrollY // Corrige problemas de scroll no mobile
        });
        
        const link = document.createElement('a');
        link.download = `curriculo.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (e) { 
        console.error(e);
        alert('Erro no download'); 
    } finally {
        // Restaura o estado visual
        paper.style.setProperty('transform', originalTransform, 'important');
        paper.style.width = originalWidth;
        paper.classList.remove('downloading');
    }
}
