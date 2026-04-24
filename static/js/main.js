let currentTemplate = 'basic';
let skills = [];

// CONFIGURAÇÃO DO PIX
const PIX_CONFIG = {
    key: "38064658861",   // <--- COLOQUE SUA CHAVE AQUI (CPF, EMAIL OU CELULAR)
    name: "MURYLOSENNE",     // <--- SEU NOME (SEM ACENTOS)
    city: "RIO CLARO",       // <--- SUA CIDADE (SEM ACENTOS)
    amount: "2.00"        // VALOR FIXO
};

// O gerador de PIX completo com CRC16 está no final do arquivo.

document.addEventListener('DOMContentLoaded', () => {
    initSync();
    initZoom();
    initSkills();
    initTemplateSelector();
    initPhoto();
    initProtection();
});

function initProtection() {
    // Bloquear clique direito no preview
    const previewCanvas = document.querySelector('.preview-canvas');
    if (previewCanvas) {
        previewCanvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    // Bloquear atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl+S, Ctrl+P, F12, Ctrl+U
        if ((e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) || e.key === 'F12') {
            e.preventDefault();
        }
        // PrintScreen
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
            alert('Prints são bloqueados para proteger o conteúdo. Por favor, use o botão de Download.');
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
            card.style.color = '#1e293b';
        });

        const selectedRadio = document.querySelector(`input[name="template"][value="${value}"]`);
        if (selectedRadio) {
            const selectedCard = selectedRadio.nextElementSibling;
            selectedCard.style.borderColor = '#2563eb';
            selectedCard.style.backgroundColor = '#eff6ff';
            selectedCard.style.color = '#2563eb';
        }
    }

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateTemplateUI(e.target.value);
        });
    });

    // Initialize UI
    const initial = document.querySelector('input[name="template"]:checked');
    if (initial) updateTemplateUI(initial.value);
}

function initSync() {
    const syncInputs = document.querySelectorAll('[data-sync]');
    syncInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const targetId = e.target.getAttribute('data-sync');
            // Try updating main target
            const target = document.getElementById(targetId);
            if (target) target.innerText = e.target.value;
            // Try updating side targets (for professional template)
            const sideTarget = document.getElementById(`${targetId}-side`);
            if (sideTarget) sideTarget.innerText = e.target.value;
        });
    });
}

function initZoom() {
    const canvas = document.getElementById('cv-preview');
    const levelDisplay = document.getElementById('zoom-level');
    let scale = 0.8;

    // Ajuste automático inicial para Mobile
    const autoScale = () => {
        if (window.innerWidth < 480) {
            // Calcula escala baseada na largura da tela (com margem de 20px)
            // 800px é a largura base aproximada do currículo A4 no navegador
            scale = (window.innerWidth - 20) / 800;
            if (scale > 0.5) scale = 0.5;
        } else {
            scale = 0.8;
        }
        updateScale();
    };

    document.getElementById('zoom-in').addEventListener('click', () => {
        if (scale < 1.2) scale += 0.1;
        updateScale();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        if (scale > 0.2) scale -= 0.1;
        updateScale();
    });

    function updateScale() {
        canvas.style.transform = `scale(${scale})`;
        levelDisplay.innerText = `${Math.round(scale * 100)}%`;
    }

    // Rodar no início e quando girar a tela
    autoScale();
    window.addEventListener('resize', autoScale);
}

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

    const previewContainer = document.getElementById('preview-exp-list');
    const phtml = `
        <div class="preview-item" id="preview-exp-${id}">
            <strong><span id="preview-exp-role-${id}">Cargo</span></strong>
            <span class="period" id="preview-exp-period-${id}">Período</span>
            <em><span id="preview-exp-comp-${id}">Empresa</span></em>
            <p id="preview-exp-desc-${id}"></p>
        </div>
    `;
    previewContainer.insertAdjacentHTML('beforeend', phtml);
}

function addEducation() {
    const container = document.getElementById('edu-items');
    const id = Date.now();
    const html = `
        <div class="dynamic-item" id="edu-${id}">
            <button type="button" class="remove-btn" onclick="removeItem('edu-${id}', 'preview-edu-${id}')">×</button>
            <div class="input-row">
                <div class="input-group">
                    <label>Tipo de Formação</label>
                    <select onchange="syncDynamic(this, 'preview-edu-type-${id}')" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem;">
                        <option value="Superior">Superior</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Pós-Graduação">Pós-Graduação</option>
                        <option value="Ensino Médio">Ensino Médio</option>
                        <option value="Curso">Curso</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Instituição</label>
                    <input type="text" placeholder="Universidade X" oninput="syncDynamic(this, 'preview-edu-school-${id}')">
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Curso</label>
                    <input type="text" placeholder="Engenharia de Software" oninput="syncDynamic(this, 'preview-edu-degree-${id}')">
                </div>
                <div class="input-group">
                    <label>Ano de Conclusão</label>
                    <input type="text" placeholder="2022" oninput="syncDynamic(this, 'preview-edu-year-${id}')">
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);

    const previewContainer = document.getElementById('preview-edu-list');
    const phtml = `
        <div class="preview-item" id="preview-edu-${id}">
            <strong><span id="preview-edu-type-${id}">Superior</span> em <span id="preview-edu-degree-${id}">Curso</span></strong>
            <span class="period" id="preview-edu-year-${id}">Ano</span>
            <em><span id="preview-edu-school-${id}">Instituição</span></em>
        </div>
    `;
    previewContainer.insertAdjacentHTML('beforeend', phtml);
}

function syncDynamic(input, targetId) {
    const target = document.getElementById(targetId);
    if (target) target.innerText = input.value;
}

function removeItem(formId, previewId) {
    document.getElementById(formId).remove();
    document.getElementById(previewId).remove();
}

function initSkills() {
    const input = document.getElementById('skill-input');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = input.value.trim().toUpperCase();
            if (val && !skills.includes(val)) {
                addSkillTag(val);
                input.value = '';
            }
        }
    });
}

function addSkillTag(name) {
    skills.push(name);
    const tagsContainer = document.getElementById('skills-tags');
    const previewMain = document.getElementById('preview-skills-list-main');
    const previewSide = document.getElementById('preview-skills-list-side');

    const id = `skill-${Date.now()}`;

    const tag = document.createElement('div');
    tag.className = 'skill-tag-input';
    tag.innerHTML = `${name} <span onclick="removeSkill('${name}', '${id}')">×</span>`;
    tag.id = id;
    tag.style = "background: #eee; padding: 2px 10px; border-radius: 4px; display: inline-flex; align-items: center; gap: 5px; margin: 2px;";
    tagsContainer.appendChild(tag);

    const pTagMain = document.createElement('div');
    pTagMain.className = 'skill-tag';
    pTagMain.id = `preview-main-${id}`;
    pTagMain.innerText = name;
    previewMain.appendChild(pTagMain);

    const pTagSide = document.createElement('div');
    pTagSide.className = 'skill-tag';
    pTagSide.id = `preview-side-${id}`;
    pTagSide.innerText = name;
    previewSide.appendChild(pTagSide);
}

function removeSkill(name, id) {
    skills = skills.filter(s => s !== name);
    document.getElementById(id).remove();
    if (document.getElementById(`preview-main-${id}`)) document.getElementById(`preview-main-${id}`).remove();
    if (document.getElementById(`preview-side-${id}`)) document.getElementById(`preview-side-${id}`).remove();
}

function switchMobileTab(tab) {
    const editor = document.querySelector('.editor-sidebar');
    const preview = document.querySelector('.preview-area');
    const btns = document.querySelectorAll('.tab-btn');
    if (tab === 'edit') {
        editor.classList.remove('hidden');
        preview.classList.add('hidden');
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        editor.classList.add('hidden');
        preview.classList.remove('hidden');
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
        setTimeout(autoScale, 100);
    }
}

function autoScale() {
    const canvas = document.querySelector('.preview-canvas');
    if (!canvas) return;
    const paper = document.getElementById('cv-preview');
    const containerWidth = canvas.clientWidth - 40;
    const paperWidth = 794;
    if (window.innerWidth <= 1024) {
        const scale = containerWidth / paperWidth;
        paper.style.transform = `scale(${scale})`;
    }
}

function collectData() {
    const data = {
        template: currentTemplate,
        name: document.getElementById('in-name').value,
        email: document.getElementById('in-email').value,
        phone: document.getElementById('in-phone').value,
        location: document.getElementById('in-location').value,
        title: document.getElementById('in-title').value,
        summary: document.getElementById('in-summary').value,
        skills: skills,
        experience: [],
        education: []
    };

    document.querySelectorAll('#exp-items .dynamic-item').forEach(item => {
        const inputs = item.querySelectorAll('input');
        data.experience.push({
            company: inputs[0].value,
            role: inputs[1].value,
            period: inputs[2].value,
            description: item.querySelector('textarea').value
        });
    });

    document.querySelectorAll('#edu-items .dynamic-item').forEach(item => {
        const type = item.querySelector('select').value;
        const inputs = item.querySelectorAll('input');
        data.education.push({
            type: type,
            school: inputs[0].value,
            degree: inputs[1].value,
            year: inputs[2].value
        });
    });

    return data;
}

function crc16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function generatePixPayload() {
    const key = PIX_CONFIG.key;
    const name = PIX_CONFIG.name.substring(0, 25).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const city = PIX_CONFIG.city.substring(0, 15).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const amount = parseFloat(PIX_CONFIG.amount).toFixed(2);

    let payload = "000201";
    payload += "26" + (22 + key.length).toString().padStart(2, '0');
    payload += "0014br.gov.bcb.pix01" + key.length.toString().padStart(2, '0') + key;
    payload += "52040000";
    payload += "5303986";
    payload += "54" + amount.length.toString().padStart(2, '0') + amount;
    payload += "5802BR";
    payload += "59" + name.length.toString().padStart(2, '0') + name;
    payload += "60" + city.length.toString().padStart(2, '0') + city;
    payload += "62070503***";
    payload += "6304";

    payload += crc16(payload);
    return payload;
}

async function downloadImage() {
    openPaymentModal();
}

function openPaymentModal() {
    const payload = generatePixPayload();
    const qrCodeImg = document.querySelector('#pix-qrcode img');
    const pixInput = document.getElementById('pix-code');

    // Gerar QR Code via API
    qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
    pixInput.value = payload;

    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

function copyPixCode() {
    const pixCode = document.getElementById('pix-code');
    pixCode.select();
    document.execCommand('copy');
    alert('Código PIX copiado! Cole no seu aplicativo do banco.');
}

async function verifyAndDownload() {
    const btn = document.querySelector('.btn-confirm');
    const originalBtn = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando pagamento...';
    btn.disabled = true;

    // Simular uma verificação de rede/pagamento de 2 segundos
    setTimeout(async () => {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Pagamento Confirmado!';
        btn.style.backgroundColor = '#059669';

        setTimeout(async () => {
            closePaymentModal();
            await executeDownload();

            // Resetar botão para próxima vez
            btn.innerHTML = originalBtn;
            btn.disabled = false;
            btn.style.backgroundColor = '';
        }, 1000);
    }, 2000);
}

async function executeDownload() {
    const btn = document.querySelector('.btn-download.pdf');
    const paper = document.getElementById('cv-preview');

    paper.classList.add('downloading');
    const originalBtn = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';

    // Guardar escala atual
    const originalTransform = paper.style.transform;

    // Resetar escala para captura perfeita
    paper.style.transform = 'scale(1)';

    try {
        // Pequeno delay para garantir o reflow do browser
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(paper, {
            scale: 2, // Alta qualidade
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        link.download = `curriculo_${currentTemplate}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (e) {
        console.error(e);
        alert('Erro ao gerar imagem');
    } finally {
        paper.style.transform = originalTransform;
        btn.innerHTML = originalBtn;
        paper.classList.remove('downloading');
    }
}
